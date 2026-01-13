import { useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useProjectStore, useTaskStore, useUIStore } from '../../../store';
import { DEFAULT_STATUSES } from '../../../types';
import type { Task } from '../../../types';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskContent } from './TaskContent';
import { TaskProgress } from './TaskProgress';
import { TaskMeta } from './TaskMeta';
import { TreeConnector } from './TreeConnector';

let suppressTaskItemClickUntil = 0;

interface TaskItemProps {
  task: Task;
  isLast?: boolean;
}

export function TaskItem({ task, isLast = false }: TaskItemProps) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const openInspector = useUIStore((s) => s.openInspector);
  const taskSort = useUIStore((s) => s.taskSort);
  const setTaskSort = useUIStore((s) => s.setTaskSort);
  const setDraggingTask = useUIStore((s) => s.setDraggingTask);
  const clearDraggingTask = useUIStore((s) => s.clearDraggingTask);
  const tasks = useTaskStore((s) => s.tasks);
  const rootTaskIds = useTaskStore((s) => s.rootTaskIds);
  const moveTask = useTaskStore((s) => s.moveTask);
  const projectStatuses = useProjectStore((s) =>
    task.projectId ? s.projects[task.projectId]?.statuses : null
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const [dropMode, setDropMode] = useState<'reorder' | 'nest'>('reorder');
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before');
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragDepthRef = useRef(0);

  const isCompleted = task.statusId === 'done';
  const statuses = projectStatuses ?? DEFAULT_STATUSES;
  const status = statuses.find((s) => s.id === task.statusId) || statuses[0];

  const visibleChildIds = task.childIds.filter((id) => {
    const child = tasks[id];
    return !!child && !child.deletedAt;
  });

  // 서브태스크 진행률 계산
  const completedChildren = visibleChildIds.filter(
    (id) => tasks[id]?.statusId === 'done'
  ).length;

  const handleClick = () => {
    if (Date.now() < suppressTaskItemClickUntil) return;
    if (isDraggingRef.current) return;
    openInspector(task.id);
  };

  useEffect(() => {
    if (!isDragOver) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Shift') return;
      setDropMode(e.type === 'keydown' ? 'nest' : 'reorder');
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [isDragOver]);

  return (
    <div
      onClick={handleClick}
      data-task-id={task.id}
      data-task-depth={task.depth}
      draggable={true}
      onDragStart={(e) => {
        if (taskSort !== 'manual') setTaskSort('manual');

        const target = e.target as HTMLElement | null;
        if (
          target?.closest('button, input, textarea, select, a, [role="button"], [data-no-drag="true"]')
        ) {
          e.preventDefault();
          return;
        }

        isDraggingRef.current = true;
        setIsDragging(true);
        dragDepthRef.current = 0;
        setDraggingTask(task.id, e.clientY);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/x-nexdo-task-id', task.id);
        e.dataTransfer.setData('text/plain', task.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsDragOver(false);
        isDraggingRef.current = false;
        dragDepthRef.current = 0;
        clearDraggingTask();
        suppressTaskItemClickUntil = Date.now() + 250;
      }}
      onDragOver={(e) => {
        const types = Array.from(e.dataTransfer.types);
        if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
        e.preventDefault();
        const nextMode = e.shiftKey ? 'nest' : 'reorder';
        if (dropMode !== nextMode) setDropMode(nextMode);

        if (!e.shiftKey) {
          const draggedId =
            e.dataTransfer.getData('application/x-nexdo-task-id') || e.dataTransfer.getData('text/plain');
          const draggedTask = draggedId ? tasks[draggedId] : null;
          const sameParent = draggedTask ? (draggedTask.parentId ?? null) === (task.parentId ?? null) : false;
          const containerIds =
            task.parentId && tasks[task.parentId]
              ? tasks[task.parentId].childIds
              : rootTaskIds;
          const draggedIndex = draggedTask && sameParent ? containerIds.indexOf(draggedTask.id) : -1;
          const targetIndex = sameParent ? containerIds.indexOf(task.id) : -1;
          const containerSize = containerIds.length;

          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const y = e.clientY - rect.top;
          const baseThreshold = rect.height / 2;
          const threshold =
            sameParent && containerSize <= 2 && draggedIndex >= 0 && targetIndex >= 0 && draggedIndex !== targetIndex
              ? draggedIndex < targetIndex
                ? Math.max(8, rect.height * 0.2)
                : rect.height - Math.max(8, rect.height * 0.2)
              : baseThreshold;
          const nextPos = y < threshold ? 'before' : 'after';
          if (dropPosition !== nextPos) setDropPosition(nextPos);
        }

        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnter={(e) => {
        const types = Array.from(e.dataTransfer.types);
        if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
        e.preventDefault();
        dragDepthRef.current += 1;
        setIsDragOver(true);

        const nextMode = e.shiftKey ? 'nest' : 'reorder';
        if (dropMode !== nextMode) setDropMode(nextMode);

        if (!e.shiftKey) {
          const draggedId =
            e.dataTransfer.getData('application/x-nexdo-task-id') || e.dataTransfer.getData('text/plain');
          const draggedTask = draggedId ? tasks[draggedId] : null;
          const sameParent = draggedTask ? (draggedTask.parentId ?? null) === (task.parentId ?? null) : false;
          const containerIds =
            task.parentId && tasks[task.parentId]
              ? tasks[task.parentId].childIds
              : rootTaskIds;
          const draggedIndex = draggedTask && sameParent ? containerIds.indexOf(draggedTask.id) : -1;
          const targetIndex = sameParent ? containerIds.indexOf(task.id) : -1;
          const containerSize = containerIds.length;

          if (sameParent && containerSize <= 2 && draggedIndex >= 0 && targetIndex >= 0 && draggedIndex !== targetIndex) {
            const intended = draggedIndex < targetIndex ? 'after' : 'before';
            if (dropPosition !== intended) setDropPosition(intended);
            return;
          }

          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const nextPos = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after';
          if (dropPosition !== nextPos) setDropPosition(nextPos);
        }
      }}
      onDragLeave={() => {
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDragOver(false);
      }}
      onDrop={(e) => {
        const types = Array.from(e.dataTransfer.types);
        if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
        e.preventDefault();
        setIsDragOver(false);
        isDraggingRef.current = false;
        dragDepthRef.current = 0;
        clearDraggingTask();
        suppressTaskItemClickUntil = Date.now() + 250;

        const draggedId =
          e.dataTransfer.getData('application/x-nexdo-task-id') || e.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        if (draggedId === task.id) return;
        if (!tasks[draggedId]) return;

        const draggedTask = tasks[draggedId];

        if (e.shiftKey) {
          moveTask(draggedId, task.id, undefined);
          return;
        }

        // root task를 서브태스크 영역(트리 내부)에 드롭했을 때: 의도는 보통 "해당 트리 아래로 이동"이므로 루트로 재정렬
        if (!draggedTask.parentId && task.parentId) {
          let rootId = task.id;
          while (tasks[rootId]?.parentId) {
            rootId = tasks[rootId].parentId as string;
          }

          const targetIndex = rootTaskIds.indexOf(rootId);
          const draggedIndex = rootTaskIds.indexOf(draggedId);
          let idx = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
          if (draggedIndex >= 0 && draggedIndex < idx) idx -= 1;
          moveTask(draggedId, null, idx >= 0 ? idx : undefined);
          return;
        }

        const targetParentId = task.parentId;
        if (targetParentId) {
          const parent = tasks[targetParentId];
          const targetIndex = parent?.childIds.indexOf(task.id) ?? -1;
          const sameParent = (draggedTask?.parentId ?? null) === targetParentId;
          const draggedIndex = sameParent ? (parent?.childIds.indexOf(draggedId) ?? -1) : -1;
          let idx = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
          if (sameParent && draggedIndex >= 0 && draggedIndex < idx) idx -= 1;
          moveTask(draggedId, targetParentId, idx >= 0 ? idx : undefined);
          return;
        }

        const targetIndex = rootTaskIds.indexOf(task.id);
        const sameParent = (draggedTask?.parentId ?? null) === null;
        const draggedIndex = sameParent ? rootTaskIds.indexOf(draggedId) : -1;
        let idx = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
        if (sameParent && draggedIndex >= 0 && draggedIndex < idx) idx -= 1;
        moveTask(draggedId, null, idx >= 0 ? idx : undefined);
      }}
      className={cn(
        'group flex items-center gap-3 px-6 py-2.5 border-b border-slate-100',
        'hover:bg-slate-50 transition-colors relative',
        isCompleted && 'opacity-60 hover:opacity-100',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'cursor-grabbing',
        isDragOver && dropMode === 'reorder' && 'bg-indigo-50',
        isDragOver && dropMode === 'nest' && 'bg-indigo-50 ring-1 ring-indigo-300'
      )}
      style={{ paddingLeft: `${task.depth * 32 + 24}px` }}
    >
      {/* Tree Connector */}
      <TreeConnector
        depth={task.depth}
        isLast={isLast}
        hasParent={!!task.parentId}
      />

      {/* Drag Handle */}
      <div
        aria-hidden="true"
        className="absolute left-1.5 opacity-0 group-hover:opacity-100 text-slate-300 cursor-grab"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {isDragOver && dropMode === 'nest' && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-600 text-white shadow-sm">
            Shift: 하위로 이동
          </span>
        </div>
      )}

      {/* Checkbox */}
      <TaskCheckbox
        checked={isCompleted}
        onChange={() => toggleComplete(task.id)}
        size={task.depth > 0 ? 'sm' : 'md'}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <TaskContent
          title={task.title}
          priority={task.priority}
          isCompleted={isCompleted}
        />
        {visibleChildIds.length > 0 && !isCompleted && (
          <TaskProgress
            completed={completedChildren}
            total={visibleChildIds.length}
          />
        )}
      </div>

      {/* Meta */}
      {!isCompleted && (
        <TaskMeta
          dueDate={task.dueDate}
          statusId={task.statusId}
          statusName={status.name}
          statusColor={status.color}
        />
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <span className="text-xs text-slate-400">Done</span>
      )}
    </div>
  );
}
