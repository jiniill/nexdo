import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import type { Task } from '../../../types';
import { cn } from '../../../lib/cn';
import { useTaskStore, useUIStore } from '../../../store';
import { Button, EmptyState } from '../../ui';
import { computeTrackedSeconds, formatDurationShort } from '../../../lib/time';

const DAY_WIDTH = 36;
const TITLE_COL_WIDTH = 280;

function getDueDate(task: Task): string | null {
  if (!task.dueDate) return null;
  return task.dueDate.slice(0, 10);
}

const priorityDot: Record<Task['priority'], string> = {
  urgent: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
  none: 'bg-slate-300',
};

export function TaskGantt({ tasks }: { tasks: Task[] }) {
  const openInspector = useUIStore((s) => s.openInspector);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [rangeDays, setRangeDays] = useState(30);
  const [start, setStart] = useState(() => startOfDay(new Date()));
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Keep ticking only when needed.
  const hasActiveTracking = useMemo(() => tasks.some((t) => !!t.trackingStartedAt), [tasks]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasActiveTracking) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasActiveTracking]);

  const days = useMemo(() => {
    return Array.from({ length: rangeDays }, (_, idx) => addDays(start, idx));
  }, [rangeDays, start]);

  const dueTasks = useMemo(() => {
    const withDue: Task[] = [];
    const withoutDue: Task[] = [];

    tasks.forEach((t) => {
      if (t.deletedAt) return;
      const due = getDueDate(t);
      if (due) withDue.push(t);
      else withoutDue.push(t);
    });

    withDue.sort((a, b) => (getDueDate(a) ?? '').localeCompare(getDueDate(b) ?? ''));
    withoutDue.sort((a, b) => a.title.localeCompare(b.title));
    return { withDue, withoutDue };
  }, [tasks]);

  if (tasks.length === 0) {
    return <EmptyState title="No tasks" description="Add a task to see it on the Gantt view" />;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => setStart((d) => addDays(d, -Math.max(1, Math.floor(rangeDays / 3))))}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconPosition="right"
          icon={<ChevronRight className="w-4 h-4" />}
          onClick={() => setStart((d) => addDays(d, Math.max(1, Math.floor(rangeDays / 3))))}
        >
          Next
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setStart(startOfDay(new Date()))}>
          Today
        </Button>

        <div className="ml-2 h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-1">
          {([14, 30, 60] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRangeDays(n)}
              className={cn(
                'px-2 py-1 text-xs rounded-md border transition-colors',
                rangeDays === n
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {n}d
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-slate-500">
          {format(days[0], 'MMM d')} – {format(days[days.length - 1], 'MMM d')}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        <div className="min-w-max">
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
            <div className="flex">
              <div
                className="flex items-center px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200"
                style={{ width: TITLE_COL_WIDTH }}
              >
                Task
              </div>
              <div className="flex">
                {days.map((d) => (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      'h-9 border-r border-slate-100 flex items-center justify-center text-[10px]',
                      isSameDay(d, new Date()) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-500'
                    )}
                    style={{ width: DAY_WIDTH }}
                    title={format(d, 'yyyy-MM-dd')}
                  >
                    {format(d, 'd')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {dueTasks.withDue.map((t) => {
            const dueStr = getDueDate(t);
            const dueDate = dueStr ? new Date(dueStr) : null;
            const dueIndex = dueDate ? days.findIndex((d) => isSameDay(d, dueDate)) : -1;

            return (
              <div key={t.id} className="flex border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => openInspector(t.id)}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('application/x-nexdo-task-id', t.id);
                    e.dataTransfer.setData('text/plain', t.id);
                  }}
                  className={cn(
                    'sticky left-0 z-[1] bg-white px-4 h-10 flex items-center gap-2 text-left',
                    'border-r border-slate-200 hover:bg-slate-50'
                  )}
                  style={{ width: TITLE_COL_WIDTH }}
                >
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityDot[t.priority])} />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{t.title}</span>
                  {dueStr && <span className="text-[10px] text-slate-400">{dueStr.slice(5)}</span>}
                  {(t.trackedSeconds || t.trackingStartedAt) && (
                    <span className={cn('ml-2 inline-flex items-center gap-1 text-[10px]', t.trackingStartedAt ? 'text-green-600' : 'text-slate-400')}>
                      <Timer className="w-3.5 h-3.5" />
                      {formatDurationShort(computeTrackedSeconds(t, nowTick))}
                    </span>
                  )}
                </button>
                <div className="flex">
                  {days.map((d, idx) => (
                    <div
                      key={d.toISOString()}
                      onDragOver={(e) => {
                        const types = Array.from(e.dataTransfer.types);
                        if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        const types = Array.from(e.dataTransfer.types);
                        if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
                        e.preventDefault();
                        const draggedId =
                          e.dataTransfer.getData('application/x-nexdo-task-id') || e.dataTransfer.getData('text/plain');
                        if (!draggedId) return;
                        updateTask(draggedId, { dueDate: format(d, 'yyyy-MM-dd') });
                      }}
                      className={cn(
                        'h-10 border-r border-slate-100 relative',
                        idx === dueIndex && 'bg-indigo-50'
                      )}
                      style={{ width: DAY_WIDTH }}
                    >
                      {idx === dueIndex && (
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
                          <div className={cn('w-1.5 h-6 rounded-full', priorityDot[t.priority])} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {dueTasks.withoutDue.length > 0 && (
            <div className="border-t border-slate-200">
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                No due date ({dueTasks.withoutDue.length})
              </div>
              {dueTasks.withoutDue.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openInspector(t.id)}
                  className="w-full px-4 h-10 flex items-center gap-2 text-left border-b border-slate-100 hover:bg-slate-50"
                >
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityDot[t.priority])} />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
