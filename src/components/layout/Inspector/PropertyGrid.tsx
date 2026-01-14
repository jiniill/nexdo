import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Timer, Flag, ChevronDown, Check, Users, Repeat, X } from 'lucide-react';
import { useProjectStore, useTaskStore, useUIStore, useUserStore } from '../../../store';
import { AvatarStack, StatusBadge } from '../../ui';
import { DEFAULT_STATUSES, PRIORITY_CONFIG, type Priority, type RecurrenceRule } from '../../../types';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../lib/cn';
import { Button } from '../../ui';
import { computeTrackedSeconds, formatDurationShort } from '../../../lib/time';
import { useClickOutside } from '../../../lib/hooks/useClickOutside';

export function PropertyGrid() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const task = useTaskStore((s) => (selectedTaskId ? s.tasks[selectedTaskId] : null));
  const updateTask = useTaskStore((s) => s.updateTask);
  const users = useUserStore((s) => s.getAllUsers());
  const project = useProjectStore((s) => (task?.projectId ? s.projects[task.projectId] : null));

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showRecurrenceMenu, setShowRecurrenceMenu] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const recurrenceRef = useRef<HTMLDivElement>(null);

  const startTracking = useTaskStore((s) => s.startTracking);
  const stopTracking = useTaskStore((s) => s.stopTracking);

  const statuses = project?.statuses ?? DEFAULT_STATUSES;
  const status = task ? statuses.find((s) => s.id === task.statusId) || statuses[0] : statuses[0];
  const priorityConfig = PRIORITY_CONFIG[task?.priority ?? 'none'];
  const dueDateValue = task?.dueDate ? task.dueDate.slice(0, 10) : '';
  const isTracking = !!task?.trackingStartedAt;
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (!isTracking) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isTracking]);

  const assigneeAvatars =
    task?.assigneeIds
      .map((id) => {
        const u = users.find((x) => x.id === id);
        return { name: u?.name ?? id };
      })
      .filter(Boolean) ?? [];

  const menuRefs = useMemo(() => [statusRef, priorityRef, assigneeRef, recurrenceRef], []);
  const anyMenuOpen = showStatusMenu || showPriorityMenu || showAssigneeMenu || showRecurrenceMenu;
  const handleOutside = useCallback(() => {
    setShowStatusMenu(false);
    setShowPriorityMenu(false);
    setShowAssigneeMenu(false);
    setShowRecurrenceMenu(false);
  }, []);
  useClickOutside({ refs: menuRefs, onOutside: handleOutside, enabled: anyMenuOpen });

  const priorityOptions: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];
  const recurrence = task?.recurrence;
  const [draftRecurrence, setDraftRecurrence] = useState<RecurrenceRule>({ frequency: 'weekly', interval: 1 });

  if (!task) return null;

  const trackedSeconds = (() => {
    if (!task) return 0;
    return computeTrackedSeconds(task, nowTick);
  })();

  const recurrenceLabel = (() => {
    if (!recurrence) return 'No repeat';
    const r = recurrence;
    const unit = r.frequency === 'daily' ? 'day' : r.frequency === 'weekly' ? 'week' : 'month';
    const every = r.interval === 1 ? `Every ${unit}` : `Every ${r.interval} ${unit}s`;
    return r.endDate ? `${every} (until ${r.endDate})` : every;
  })();

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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-slate-500">Est.</span>
            <input
              type="number"
              min={0}
              value={task.estimatedMinutes ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  updateTask(task.id, { estimatedMinutes: undefined });
                  return;
                }
                const n = Number.parseInt(raw, 10);
                updateTask(task.id, { estimatedMinutes: Number.isFinite(n) ? Math.max(0, n) : undefined });
              }}
              className="w-20 text-xs text-slate-600 rounded-md border border-slate-200 bg-white px-2 py-1 hover:border-slate-300"
              placeholder="min"
              aria-label="Estimated minutes"
            />
            <span className="text-slate-500">Tracked</span>
            <span className="text-slate-700">{formatDurationShort(trackedSeconds)}</span>

            <span className="ml-auto">
              {isTracking ? (
                <Button
                  type="button"
                  size="xs"
                  variant="danger"
                  onClick={() => stopTracking(task.id)}
                >
                  Stop
                </Button>
              ) : (
                <Button
                  type="button"
                  size="xs"
                  variant="success"
                  onClick={() => startTracking(task.id)}
                >
                  Start
                </Button>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Repeat */}
      <div className="text-slate-500 font-medium col-span-1 py-1">Repeat</div>
      <div className="col-span-2">
        <div className="relative inline-block" ref={recurrenceRef}>
          <button
            type="button"
            onClick={() => {
              setShowRecurrenceMenu((v) => {
                const next = !v;
                if (next) {
                  setDraftRecurrence(recurrence ?? { frequency: 'weekly', interval: 1 });
                }
                return next;
              });
              setShowStatusMenu(false);
              setShowPriorityMenu(false);
              setShowAssigneeMenu(false);
            }}
            className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className={cn('inline-flex items-center gap-1 text-xs', recurrence ? 'text-slate-700' : 'text-slate-400')}>
              <Repeat className="w-3.5 h-3.5" />
              {recurrenceLabel}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', showRecurrenceMenu && 'rotate-180')} />
          </button>

          {showRecurrenceMenu && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repeat</div>
                {task.recurrence && (
                  <button
                    type="button"
                    onClick={() => {
                      updateTask(task.id, { recurrence: undefined });
                      setDraftRecurrence({ frequency: 'weekly', interval: 1 });
                      setShowRecurrenceMenu(false);
                    }}
                    className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  Frequency
                  <select
                    value={draftRecurrence.frequency}
                    onChange={(e) =>
                      setDraftRecurrence((prev) => ({ ...prev, frequency: e.target.value as RecurrenceRule['frequency'] }))
                    }
                    className="mt-1 w-full text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>

                <label className="text-xs text-slate-500">
                  Interval
                  <input
                    type="number"
                    min={1}
                    value={draftRecurrence.interval}
                    onChange={(e) => {
                      const next = Number.parseInt(e.target.value || '1', 10);
                      setDraftRecurrence((prev) => ({ ...prev, interval: Number.isFinite(next) ? Math.max(1, next) : 1 }));
                    }}
                    className="mt-1 w-full text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
                  />
                </label>
              </div>

              <label className="mt-2 block text-xs text-slate-500">
                End date (optional)
                <input
                  type="date"
                  value={draftRecurrence.endDate ?? ''}
                  onChange={(e) =>
                    setDraftRecurrence((prev) => ({ ...prev, endDate: e.target.value || undefined }))
                  }
                  className="mt-1 w-full text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700"
                />
              </label>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateTask(task.id, { recurrence: { ...draftRecurrence, interval: Math.max(1, draftRecurrence.interval || 1) } });
                    setShowRecurrenceMenu(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
