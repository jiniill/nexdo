import { useMemo, useRef, useState } from 'react';
import { Plus, Timer } from 'lucide-react';
import type { Status, Task } from '../../../types';
import { cn } from '../../../lib/cn';
import { useTaskStore, useUIStore } from '../../../store';
import { StatusBadge } from '../../ui';
import { formatDurationShort } from '../../../lib/time';

interface TaskBoardProps {
  tasks: Task[];
  statuses: Status[];
  onAddTask?: () => void;
}

type DropState =
  | { statusId: string; y: number; index: number }
  | null;

export function TaskBoard({ tasks, statuses, onAddTask }: TaskBoardProps) {
  const allTasks = useTaskStore((s) => s.tasks);
  const rootTaskIds = useTaskStore((s) => s.rootTaskIds);
  const updateTask = useTaskStore((s) => s.updateTask);
  const moveTask = useTaskStore((s) => s.moveTask);

  const taskSort = useUIStore((s) => s.taskSort);
  const draggingTask = useUIStore((s) => s.draggingTask);
  const setDraggingTask = useUIStore((s) => s.setDraggingTask);
  const clearDraggingTask = useUIStore((s) => s.clearDraggingTask);
  const openInspector = useUIStore((s) => s.openInspector);

  const [drop, setDrop] = useState<DropState>(null);
  const suppressNextClickRef = useRef(false);

  const rootTasks = useMemo(() => tasks.filter((t) => !t.parentId && !t.deletedAt), [tasks]);

  const orderedStatuses = useMemo(() => [...statuses].sort((a, b) => a.order - b.order), [statuses]);

  const tasksByStatus = useMemo(() => {
    const by: Record<string, Task[]> = {};
    orderedStatuses.forEach((s) => {
      by[s.id] = [];
    });

    const order = new Map<string, number>();
    if (taskSort === 'manual') {
      rootTaskIds.forEach((id, idx) => order.set(id, idx));
    } else {
      rootTasks.forEach((t, idx) => order.set(t.id, idx));
    }

    rootTasks.forEach((t) => {
      if (!by[t.statusId]) by[t.statusId] = [];
      by[t.statusId].push(t);
    });

    Object.keys(by).forEach((k) => {
      by[k].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    });

    return by;
  }, [orderedStatuses, rootTaskIds, rootTasks, taskSort]);

  const computeColumnDrop = (e: React.DragEvent<HTMLDivElement>, statusId: string) => {
    if (!draggingTask) return null;
    const dragged = allTasks[draggingTask.taskId];
    if (!dragged) return null;
    if (dragged.deletedAt) return null;
    if (dragged.parentId) return null;
    if (e.shiftKey) return null;

    const column = e.currentTarget;
    const wrapperRect = column.getBoundingClientRect();
    const cards = Array.from(column.querySelectorAll<HTMLElement>('[data-board-card="true"][data-task-id]'));

    const clientY = e.clientY;

    if (cards.length === 0) {
      return { statusId, index: 0, y: 56 };
    }

    let bestBoundaryIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    const boundaries = cards.map((c) => c.getBoundingClientRect().top);
    boundaries.push(cards[cards.length - 1].getBoundingClientRect().bottom);

    for (let i = 0; i < boundaries.length; i += 1) {
      const d = Math.abs(clientY - boundaries[i]);
      if (d < bestDist) {
        bestDist = d;
        bestBoundaryIndex = i;
      }
    }

    const y = boundaries[bestBoundaryIndex] - wrapperRect.top;
    return { statusId, index: bestBoundaryIndex, y };
  };

  const applyDrop = (statusId: string, index: number) => {
    if (!draggingTask) return;
    const draggedId = draggingTask.taskId;
    const dragged = allTasks[draggedId];
    if (!dragged) return;
    if (dragged.deletedAt) return;
    if (dragged.parentId) return;

    const columnTasks = tasksByStatus[statusId] ?? [];
    const filtered = columnTasks.filter((t) => t.id !== draggedId);

    if (dragged.statusId !== statusId) {
      updateTask(draggedId, { statusId });
    }

    if (taskSort === 'manual') {
      const before = index < filtered.length ? filtered[index] : null;
      let rootIndex = -1;
      if (before) {
        rootIndex = rootTaskIds.indexOf(before.id);
      } else if (filtered.length > 0) {
        const last = filtered[filtered.length - 1];
        const lastIndex = rootTaskIds.indexOf(last.id);
        rootIndex = lastIndex >= 0 ? lastIndex + 1 : rootTaskIds.length;
      } else {
        rootIndex = rootTaskIds.length;
      }

      moveTask(draggedId, null, rootIndex >= 0 ? rootIndex : undefined);
    }

    suppressNextClickRef.current = true;
    setDrop(null);
    clearDraggingTask();
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-x-auto overflow-y-hidden bg-slate-50">
        <div className="h-full flex gap-4 px-6 py-4 min-w-max">
          {orderedStatuses.map((status) => {
            const colTasks = tasksByStatus[status.id] ?? [];
            return (
              <div
                key={status.id}
                className="w-80 flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden"
                onDragOver={(e) => {
                  const next = computeColumnDrop(e, status.id);
                  if (!next) return;
                  e.preventDefault();
                  setDrop((prev) => (prev && prev.statusId === next.statusId && prev.y === next.y ? prev : next));
                }}
                onDragLeave={() => {
                  setDrop((prev) => (prev?.statusId === status.id ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const next = computeColumnDrop(e, status.id);
                  setDrop(null);
                  if (!next) return;
                  applyDrop(next.statusId, next.index);
                }}
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusBadge statusId={status.id} statusName={status.name} color={status.color} />
                    <span className="text-xs text-slate-400">{colTasks.length}</span>
                  </div>
                  {onAddTask && status.id === 'todo' && (
                    <button
                      type="button"
                      onClick={onAddTask}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      aria-label="Add task"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="relative flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                  {drop && drop.statusId === status.id && (
                    <div
                      className="pointer-events-none absolute left-3 right-3 h-0.5 bg-indigo-500"
                      style={{ top: drop.y - 1 }}
                    />
                  )}

                  {colTasks.length === 0 ? (
                    <div className="text-xs text-slate-400 p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                      Drop a task here
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        data-board-card="true"
                        data-task-id={t.id}
                        draggable={true}
                        onDragStart={(e) => {
                          const target = e.target as HTMLElement | null;
                          if (target?.closest('input, textarea, select, a')) {
                            e.preventDefault();
                            return;
                          }
                          setDraggingTask(t.id, e.clientY);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('application/x-nexdo-task-id', t.id);
                          e.dataTransfer.setData('text/plain', t.id);
                        }}
                        onDragEnd={() => {
                          clearDraggingTask();
                          setDrop(null);
                          suppressNextClickRef.current = true;
                        }}
                        onClick={() => {
                          if (suppressNextClickRef.current) {
                            suppressNextClickRef.current = false;
                            return;
                          }
                          openInspector(t.id);
                        }}
                        className={cn(
                          'w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm',
                          'hover:border-slate-300 hover:bg-slate-50/40 transition-colors'
                        )}
                      >
                        <div className="text-sm font-medium text-slate-900 line-clamp-2">{t.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          {t.childIds.length > 0 && (
                            <span>{t.childIds.filter((id) => allTasks[id] && !allTasks[id].deletedAt).length} sub</span>
                          )}
                          {t.dueDate && <span>{t.dueDate.slice(0, 10)}</span>}
                          {(t.trackedSeconds || t.trackingStartedAt) && (
                            <span className={cn('inline-flex items-center gap-1', t.trackingStartedAt && 'text-green-600')}>
                              <Timer className="w-3.5 h-3.5" />
                              {t.trackedSeconds ? formatDurationShort(t.trackedSeconds) : 'Tracking'}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
