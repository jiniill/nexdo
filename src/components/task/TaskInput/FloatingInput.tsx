import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ArrowUp, Flag, User, Hash, ChevronDown, AlertCircle } from 'lucide-react';
import { useProjectStore, useTaskStore, useUserStore } from '../../../store';
import { cn } from '../../../lib/cn';
import { useAttentionPulse } from '../../../lib/hooks/useAttentionPulse';
import { addDays, format } from 'date-fns';
import type { RecurrenceRule } from '../../../types';

interface FloatingInputProps {
  projectId?: string;
}

type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: '긴급', color: 'text-red-600 bg-red-50' },
  { value: 'high', label: '높음', color: 'text-amber-600 bg-amber-50' },
  { value: 'medium', label: '보통', color: 'text-blue-600 bg-blue-50' },
  { value: 'low', label: '낮음', color: 'text-slate-600 bg-slate-50' },
  { value: 'none', label: '없음', color: 'text-slate-400 bg-slate-50' },
];

const projectColorDots: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  pink: 'bg-pink-500',
};

export function FloatingInput({ projectId }: FloatingInputProps) {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedContentMounted, setIsExpandedContentMounted] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [selectedProject, setSelectedProject] = useState<string | null>(projectId || null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');

  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { isPulsing: isAttentionPulse, trigger: triggerAttentionPulse } = useAttentionPulse(700);
  const addTask = useTaskStore((s) => s.addTask);
  const projects = useProjectStore((s) => s.getAllProjects());
  const users = useUserStore((s) => s.getAllUsers());

  const parseQuickCapture = useCallback(
    (input: string) => {
      const parts = input.trim().split(/\s+/).filter(Boolean);

      let parsedProjectId: string | undefined;
      let parsedAssigneeId: string | undefined;
      let parsedPriority: Priority | undefined;
      let parsedDueDate: string | undefined;
      let parsedRecurrence: RecurrenceRule | undefined;
      const parsedLabels: string[] = [];
      const remaining: string[] = [];

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

      const normalize = (s: string) => s.trim().toLowerCase();
      const byProjectId = new Map(projects.map((p) => [normalize(p.id), p.id]));
      const byProjectName = new Map(projects.map((p) => [normalize(p.name), p.id]));

      const byUserId = new Map(users.map((u) => [normalize(u.id), u.id]));
      const byUserName = new Map(users.map((u) => [normalize(u.name), u.id]));

      const parsePriorityToken = (raw: string): Priority | null => {
        const key = normalize(raw.replace(/^!+/, ''));
        if (!key) return null;
        if (['urgent', '긴급'].includes(key)) return 'urgent';
        if (['high', 'p1', '높음'].includes(key)) return 'high';
        if (['medium', 'p2', '보통'].includes(key)) return 'medium';
        if (['low', 'p3', '낮음'].includes(key)) return 'low';
        if (['none', '없음'].includes(key)) return 'none';
        return null;
      };

      const parseRecurrenceToken = (raw: string): RecurrenceRule | null => {
        const token = normalize(raw);

        const simple: Record<string, RecurrenceRule['frequency']> = {
          daily: 'daily',
          everyday: 'daily',
          '매일': 'daily',
          weekly: 'weekly',
          '매주': 'weekly',
          monthly: 'monthly',
          '매월': 'monthly',
        };

        if (simple[token]) return { frequency: simple[token], interval: 1 };

        const prefixed = token.startsWith('repeat:') ? token.slice('repeat:'.length) : null;
        if (prefixed) {
          const match =
            prefixed.match(/^(daily|weekly|monthly)$/) ||
            prefixed.match(/^(\d+)(d|w|m)$/) ||
            prefixed.match(/^(daily|weekly|monthly):(\d+)$/);

          if (!match) return null;

          if (match.length === 2) {
            return { frequency: match[1] as RecurrenceRule['frequency'], interval: 1 };
          }

          if (match.length === 3) {
            const interval = Number.parseInt(match[1], 10);
            const unit = match[2];
            if (!Number.isFinite(interval) || interval <= 0) return null;
            const frequency: RecurrenceRule['frequency'] = unit === 'd' ? 'daily' : unit === 'w' ? 'weekly' : 'monthly';
            return { frequency, interval };
          }

          if (match.length === 4) {
            const frequency = match[1] as RecurrenceRule['frequency'];
            const interval = Number.parseInt(match[2], 10);
            if (!Number.isFinite(interval) || interval <= 0) return null;
            return { frequency, interval };
          }
        }

        const compact = token.match(/^every(\d+)?(d|w|m)$/);
        if (compact) {
          const interval = compact[1] ? Number.parseInt(compact[1], 10) : 1;
          const unit = compact[2];
          if (!Number.isFinite(interval) || interval <= 0) return null;
          const frequency: RecurrenceRule['frequency'] = unit === 'd' ? 'daily' : unit === 'w' ? 'weekly' : 'monthly';
          return { frequency, interval };
        }

        return null;
      };

      for (const part of parts) {
        if (part.startsWith('#')) {
          const raw = part.slice(1);
          const key = normalize(raw);
          const match = byProjectId.get(key) || byProjectName.get(key);
          if (match && !parsedProjectId) {
            parsedProjectId = match;
            continue;
          }
          if (raw) parsedLabels.push(raw);
          continue;
        }

        if (part.startsWith('@')) {
          const raw = part.slice(1);
          const key = normalize(raw);
          const match = byUserId.get(key) || byUserName.get(key);
          if (match && !parsedAssigneeId) {
            parsedAssigneeId = match;
            continue;
          }
          continue;
        }

        if (part.startsWith('!')) {
          const p = parsePriorityToken(part);
          if (p && !parsedPriority) {
            parsedPriority = p;
            continue;
          }
        }

        if (!parsedRecurrence) {
          const r = parseRecurrenceToken(part);
          if (r) {
            parsedRecurrence = r;
            continue;
          }
        }

        if (parsedRecurrence && /^until:\d{4}-\d{2}-\d{2}$/i.test(part) && !parsedRecurrence.endDate) {
          parsedRecurrence = { ...parsedRecurrence, endDate: part.slice('until:'.length) };
          continue;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(part) && !parsedDueDate) {
          parsedDueDate = part;
          continue;
        }

        const word = normalize(part);
        if (!parsedDueDate && (word === 'today' || word === '오늘')) {
          parsedDueDate = todayStr;
          continue;
        }
        if (!parsedDueDate && (word === 'tomorrow' || word === '내일')) {
          parsedDueDate = tomorrowStr;
          continue;
        }

        remaining.push(part);
      }

      return {
        title: remaining.join(' ').trim(),
        projectId: parsedProjectId,
        assigneeId: parsedAssigneeId,
        priority: parsedPriority,
        dueDate: parsedDueDate,
        recurrence: parsedRecurrence,
        labels: parsedLabels,
      };
    },
    [projects, users]
  );

  const handleOpen = useCallback(() => {
    setIsExpandedContentMounted(true);
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setValue('');
    setDescription('');
    setPriority('none');
    setSelectedProject(projectId || null);
    setSelectedAssignee(null);
    setDueDate('');
    setShowPriorityMenu(false);
    setShowProjectMenu(false);
    setShowAssigneeMenu(false);
  }, [projectId]);

  const handleSubmit = () => {
    const parsed = parseQuickCapture(value);
    const title = parsed.title || value.trim();
    if (title.trim()) {
      const finalDueDate = parsed.dueDate ?? (dueDate.trim() ? dueDate : undefined);
      addTask(title.trim(), {
        projectId: parsed.projectId ?? (selectedProject ?? undefined),
        priority: parsed.priority ?? priority,
        dueDate: finalDueDate,
        description: description || undefined,
        assigneeIds: parsed.assigneeId ? [parsed.assigneeId] : selectedAssignee ? [selectedAssignee] : [],
        recurrence: parsed.recurrence,
        labels: parsed.labels,
      });
      handleClose();
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
      if (e.key === 'c' && !isExpanded && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleOpen();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, handleOpen, isExpanded]);

  useEffect(() => {
    const handleQuickCapture = () => {
      handleOpen();
      triggerAttentionPulse();
    };

    window.addEventListener('nexdo:quick-capture', handleQuickCapture);
    return () => window.removeEventListener('nexdo:quick-capture', handleQuickCapture);
  }, [handleOpen, triggerAttentionPulse]);

  useEffect(() => {
    if (isExpanded) return;
    if (!isExpandedContentMounted) return;

    const timeoutId = window.setTimeout(() => {
      setIsExpandedContentMounted(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [isExpanded, isExpandedContentMounted]);

  const currentPriority = priorityOptions.find(p => p.value === priority);
  const currentProject = projects.find(p => p.id === selectedProject);
  const currentAssignee = users.find(a => a.id === selectedAssignee);
  const isPanelExpandedUI = isExpanded || isExpandedContentMounted;

  return (
    <>
      {/* Backdrop (main content only) */}
      {isExpandedContentMounted && (
        <div
          className={cn(
            'absolute inset-0 z-40 bg-slate-900/30 transition-opacity duration-200',
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={handleClose}
        />
      )}

      {/* Expanding Input Panel */}
      <div className="absolute bottom-6 left-6 right-6 lg:left-20 lg:right-20 z-50">
        <div className={cn('rounded-xl', isAttentionPulse && 'nexdo-attention-pulse')}>
          <div
            className={cn(
              'bg-white rounded-xl shadow-2xl border border-slate-200 ring-1 ring-slate-900/5 overflow-hidden flex flex-col transition-[height] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
              isExpanded ? 'h-[min(420px,60vh)]' : 'h-[52px]'
            )}
          >
          {/* Title Row */}
          <div
            className={cn(
              'p-2 flex items-center gap-3',
              isPanelExpandedUI && 'border-b border-slate-200'
            )}
          >
            <button
              onClick={() => (isExpanded ? handleClose() : handleOpen())}
              aria-label={isExpanded ? '입력 닫기' : '새 태스크 추가'}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isExpanded
                  ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-primary-100 hover:text-primary-600'
              )}
            >
              <Plus className={cn('w-5 h-5 transition-transform duration-300', isExpanded && 'rotate-45')} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onFocus={handleOpen}
              placeholder={isExpanded ? '태스크 제목' : '새로운 태스크 입력... (예: 내일 오후 3시 디자인 리뷰 #업무 !높음)'}
              className={cn(
                'flex-1 bg-transparent border-none focus:ring-0 focus:outline-none font-medium placeholder:text-slate-400',
                isExpanded ? 'text-lg py-2' : 'text-sm py-2'
              )}
            />

            <div className="flex items-center gap-1 text-slate-400 pr-2">
              {!isExpanded && (
                <>
                  <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                    #Project
                  </span>
                  <span className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                    @Person
                  </span>
                </>
              )}
              <button
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white p-1.5 rounded-lg transition-colors ml-2 shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpandedContentMounted && (
            <div
              className={cn(
                'transition-opacity duration-200 flex flex-col flex-1 min-h-0',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="p-4 space-y-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
                {/* Description */}
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="설명 추가 (선택)"
                    rows={3}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Properties */}
                <div className="flex flex-wrap gap-2">
                  {/* Priority */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowPriorityMenu(!showPriorityMenu);
                        setShowProjectMenu(false);
                        setShowAssigneeMenu(false);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg border transition-all',
                        priority !== 'none'
                          ? currentPriority?.color + ' border-current'
                          : 'text-slate-600 border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {currentPriority?.label || '우선순위'}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showPriorityMenu && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                        {priorityOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setPriority(opt.value);
                              setShowPriorityMenu(false);
                            }}
                            className={cn(
                              'w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center gap-2',
                              priority === opt.value && 'bg-slate-50'
                            )}
                          >
                            <AlertCircle className={cn('w-3.5 h-3.5', opt.color.split(' ')[0])} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowProjectMenu(!showProjectMenu);
                        setShowPriorityMenu(false);
                        setShowAssigneeMenu(false);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                    >
                    {currentProject ? (
                      <>
                        <span className={cn('w-2 h-2 rounded-full', projectColorDots[currentProject.color] || 'bg-slate-400')} />
                        {currentProject.name}
                      </>
                    ) : (
                        <>
                          <Hash className="w-3.5 h-3.5" />
                          프로젝트
                        </>
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showProjectMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setSelectedProject(null);
                            setShowProjectMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-sm text-left text-slate-400 hover:bg-slate-50"
                        >
                          없음
                        </button>
                      {projects.map(proj => (
                        <button
                          key={proj.id}
                          onClick={() => {
                            setSelectedProject(proj.id);
                            setShowProjectMenu(false);
                          }}
                          className={cn(
                            'w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center gap-2',
                            selectedProject === proj.id && 'bg-slate-50'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full', projectColorDots[proj.color] || 'bg-slate-400')} />
                          {proj.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                  {/* Assignee */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAssigneeMenu(!showAssigneeMenu);
                        setShowPriorityMenu(false);
                        setShowProjectMenu(false);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                    >
                      <User className="w-3.5 h-3.5" />
                      {currentAssignee?.name || '담당자'}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showAssigneeMenu && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setSelectedAssignee(null);
                            setShowAssigneeMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-sm text-left text-slate-400 hover:bg-slate-50"
                        >
                          없음
                        </button>
                      {users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedAssignee(user.id);
                            setShowAssigneeMenu(false);
                          }}
                          className={cn(
                            'w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50',
                            selectedAssignee === user.id && 'bg-slate-50'
                          )}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                  {/* Due Date */}
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">ESC</kbd>
                  <span className="ml-1">닫기</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                    className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white rounded-lg transition-colors font-medium"
                  >
                    태스크 만들기
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
