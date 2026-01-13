import { useEffect, useRef, useState } from 'react';
import { Calendar, Timer, Flag, ChevronDown, Check, Users } from 'lucide-react';
import { useProjectStore, useTaskStore, useUIStore, useUserStore } from '../../../store';
import { AvatarStack, StatusBadge } from '../../ui';
import { DEFAULT_STATUSES, PRIORITY_CONFIG, type Priority } from '../../../types';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../lib/cn';

export function PropertyGrid() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const updateTask = useTaskStore((s) => s.updateTask);
  const users = useUserStore((s) => s.getAllUsers());
  const project = useProjectStore((s) => (task?.projectId ? s.projects[task.projectId] : null));

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  const statuses = project?.statuses ?? DEFAULT_STATUSES;
  const status = task ? statuses.find((s) => s.id === task.statusId) || statuses[0] : statuses[0];
  const priorityConfig = PRIORITY_CONFIG[task?.priority ?? 'none'];
  const dueDateValue = task?.dueDate ? task.dueDate.slice(0, 10) : '';

  const assigneeAvatars =
    task?.assigneeIds
      .map((id) => {
        const u = users.find((x) => x.id === id);
        return { name: u?.name ?? id };
      })
      .filter(Boolean) ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (statusRef.current && !statusRef.current.contains(target)) {
        setShowStatusMenu(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(target)) {
        setShowPriorityMenu(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(target)) {
        setShowAssigneeMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priorityOptions: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];

  if (!task) return null;

  return (
    <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
      {/* Status */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Status</div>
      <div className="col-span-2">
        <div className="relative inline-block" ref={statusRef}>
          <button
            type="button"
            onClick={() => {
              setShowStatusMenu((v) => !v);
              setShowPriorityMenu(false);
              setShowAssigneeMenu(false);
            }}
            className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <StatusBadge statusId={status.id} statusName={status.name} color={status.color} />
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', showStatusMenu && 'rotate-180')} />
          </button>
          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { statusId: s.id });
                    setShowStatusMenu(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2',
                    task.statusId === s.id && 'bg-slate-50'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <StatusBadge statusId={s.id} statusName={s.name} color={s.color} />
                  </span>
                  {task.statusId === s.id && <Check className="w-4 h-4 text-primary-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Priority</div>
      <div className="col-span-2">
        <div className="relative inline-block" ref={priorityRef}>
          <button
            type="button"
            onClick={() => {
              setShowPriorityMenu((v) => !v);
              setShowStatusMenu(false);
              setShowAssigneeMenu(false);
            }}
            className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            {task.priority !== 'none' ? (
              <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border', priorityConfig.bg, priorityConfig.text)}>
                <Flag className="w-3 h-3" />
                {priorityConfig.label}
              </span>
            ) : (
              <span className="text-slate-400 text-xs inline-flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                No priority
              </span>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', showPriorityMenu && 'rotate-180')} />
          </button>
          {showPriorityMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              {priorityOptions.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = task.priority === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      updateTask(task.id, { priority: p });
                      setShowPriorityMenu(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center justify-between',
                      isActive && 'bg-slate-50'
                    )}
                  >
                    <span className={cn('inline-flex items-center gap-2', p === 'none' && 'text-slate-500')}>
                      <Flag className={cn('w-4 h-4', cfg?.text || 'text-slate-400')} />
                      {p === 'none' ? 'No priority' : cfg.label}
                    </span>
                    {isActive && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assignees */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Assignees</div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="relative" ref={assigneeRef}>
          <button
            type="button"
            onClick={() => {
              setShowAssigneeMenu((v) => !v);
              setShowStatusMenu(false);
              setShowPriorityMenu(false);
            }}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            {assigneeAvatars.length > 0 ? (
              <AvatarStack avatars={assigneeAvatars} max={3} size="sm" />
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                <Users className="w-4 h-4" />
                Add assignee
              </span>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', showAssigneeMenu && 'rotate-180')} />
          </button>

          {showAssigneeMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              {users.map((u) => {
                const checked = task.assigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? task.assigneeIds.filter((id) => id !== u.id)
                        : [...task.assigneeIds, u.id];
                      updateTask(task.id, { assigneeIds: next });
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2',
                      checked && 'bg-slate-50'
                    )}
                  >
                    <span className="flex-1 min-w-0 truncate">{u.name}</span>
                    {checked && <Check className="w-4 h-4 text-primary-600" />}
                  </button>
                );
              })}
              <div className="h-px bg-slate-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  updateTask(task.id, { assigneeIds: [] });
                  setShowAssigneeMenu(false);
                }}
                className="w-full px-3 py-2 text-sm text-left text-slate-500 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Timeline</div>
      <div className="col-span-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {task.dueDate ? (
            <span className="text-slate-700 text-sm">
              {format(parseISO(task.dueDate), 'MMM d, yyyy')}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">No due date</span>
          )}
          <input
            type="date"
            value={dueDateValue}
            onChange={(e) => {
              const next = e.target.value;
              updateTask(task.id, { dueDate: next ? next : undefined });
            }}
            className="ml-auto text-xs text-slate-600 rounded-md border border-slate-200 bg-white px-2 py-1 hover:border-slate-300"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Timer className="w-3.5 h-3.5 text-slate-400" />
          <span>Est. -- / Tracked --</span>
        </div>
      </div>
    </div>
  );
}
