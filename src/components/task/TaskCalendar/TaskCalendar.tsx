import { useMemo, useState } from 'react';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import type { Task } from '../../../types';
import { cn } from '../../../lib/cn';
import { useTaskStore, useUIStore } from '../../../store';
import { Button, EmptyState } from '../../ui';
import { formatDurationShort } from '../../../lib/time';

function getDueDate(task: Task): Date | null {
  if (!task.dueDate) return null;
  const value = task.dueDate.slice(0, 10);
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function TaskCalendar({ tasks }: { tasks: Task[] }) {
  const openInspector = useUIStore((s) => s.openInspector);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const { weeks, tasksByDay } = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dayToTasks = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (t.deletedAt) return;
      const due = getDueDate(t);
      if (!due) return;
      const key = format(due, 'yyyy-MM-dd');
      const list = dayToTasks.get(key) ?? [];
      list.push(t);
      dayToTasks.set(key, list);
    });
    dayToTasks.forEach((list) => list.sort((a, b) => (a.title || '').localeCompare(b.title)));

    const days: Date[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { weeks, tasksByDay: dayToTasks };
  }, [cursor, tasks]);

  if (tasks.length === 0) {
    return <EmptyState title="No tasks" description="Add a task to see it on the calendar" />;
  }

  const monthLabel = format(cursor, 'MMMM yyyy');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => setCursor((d) => addMonths(d, -1))}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconPosition="right"
          icon={<ChevronRight className="w-4 h-4" />}
          onClick={() => setCursor((d) => addMonths(d, 1))}
        >
          Next
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
          This month
        </Button>
        <div className="ml-auto text-sm font-semibold text-slate-800">{monthLabel}</div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        <div className="min-w-[720px] px-6 py-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map((w) => (
              <div key={w} className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeks.flat().map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const list = tasksByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const isToday = isSameDay(day, new Date());
              const shown = list.slice(0, 3);
              const more = list.length - shown.length;

              return (
                <div
                  key={key}
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
                    updateTask(draggedId, { dueDate: key });
                  }}
                  className={cn(
                    'rounded-lg border p-2 min-h-28 flex flex-col gap-1',
                    inMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60',
                    isToday && 'ring-2 ring-primary-500/20 border-primary-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn('text-xs font-semibold', inMonth ? 'text-slate-700' : 'text-slate-400')}>
                      {format(day, 'd')}
                    </div>
                    {list.length > 0 && (
                      <div className="text-[10px] text-slate-400">{list.length}</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    {shown.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openInspector(t.id)}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('application/x-nexdo-task-id', t.id);
                          e.dataTransfer.setData('text/plain', t.id);
                        }}
                        className={cn(
                          'w-full text-left text-[11px] rounded-md px-2 py-1 border',
                          'border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors'
                        )}
                        title={t.title}
                      >
                        <span className="flex items-center gap-1 min-w-0">
                          <span className="line-clamp-1 text-slate-700 flex-1">{t.title}</span>
                          {(t.trackedSeconds || t.trackingStartedAt) && (
                            <span className={cn('inline-flex items-center gap-1 text-[10px]', t.trackingStartedAt ? 'text-green-700' : 'text-slate-400')}>
                              <Timer className="w-3 h-3" />
                              {t.trackedSeconds ? formatDurationShort(t.trackedSeconds) : 'Tracking'}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                    {more > 0 && (
                      <div className="text-[10px] text-slate-400 px-1">+{more} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
