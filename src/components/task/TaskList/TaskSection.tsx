import React, { useMemo, useRef, useState } from 'react';
import { useTaskStore, useUIStore } from '../../../store';
import type { Task } from '../../../types';
import { TaskItem } from '../TaskItem';
import { TaskSectionHeader } from './TaskSectionHeader';

interface TaskSectionProps {
  id: string;
  title: string;
  tasks: Task[];
  allTasks: Record<string, Task>;
}

// 재귀적으로 태스크와 자식들을 렌더링
function renderTaskTree(
  task: Task,
  allTasks: Record<string, Task>,
  isLast: boolean
): React.ReactNode[] {
  if (task.deletedAt) return [];
  const elements: React.ReactNode[] = [
    <TaskItem key={task.id} task={task} isLast={isLast} />,
  ];

  const visibleChildIds = task.childIds.filter((childId) => {
    const child = allTasks[childId];
    return !!child && !child.deletedAt;
  });

  visibleChildIds.forEach((childId, index) => {
    const child = allTasks[childId];
    if (child) {
      const isLastChild = index === visibleChildIds.length - 1;
      elements.push(...renderTaskTree(child, allTasks, isLastChild));
    }
  });

  return elements;
}

export function TaskSection({ id, title, tasks, allTasks }: TaskSectionProps) {
  const isCollapsed = useUIStore((s) => s.collapsedSections[id] ?? false);
  const toggleSection = useUIStore((s) => s.toggleSection);
  const taskSort = useUIStore((s) => s.taskSort);
  const draggingTask = useUIStore((s) => s.draggingTask);
  const rootTaskIds = useTaskStore((s) => s.rootTaskIds);
  const moveTask = useTaskStore((s) => s.moveTask);

  const rootListRef = useRef<HTMLDivElement>(null);
  const dragDepthRef = useRef(0);
  const [dropIndicatorY, setDropIndicatorY] = useState<number | null>(null);

  const rootTasks = useMemo(() => {
    const visibleRootTasks = tasks.filter((t) => !t.parentId);
    if (taskSort !== 'manual') return visibleRootTasks;

    const visibleRootIds = new Set(visibleRootTasks.map((t) => t.id));
    return rootTaskIds
      .map((taskId) => allTasks[taskId])
      .filter((t): t is Task => !!t && visibleRootIds.has(t.id) && !t.deletedAt);
  }, [allTasks, rootTaskIds, taskSort, tasks]);

  const computeReorderDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (taskSort !== 'manual') return null;
    const container = rootListRef.current;
    if (!container) return null;
    if (e.shiftKey) return null;

    const types = Array.from(e.dataTransfer.types);
    if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return null;

    const dragging = useUIStore.getState().draggingTask;
    const draggedId = dragging?.taskId;
    if (!draggedId) return null;

    const draggedTask = allTasks[draggedId];
    if (!draggedTask) return null;
    if (draggedTask.deletedAt) return null;

    const allRowEls = Array.from(container.querySelectorAll<HTMLElement>('[data-task-id][data-task-depth]'));
    if (allRowEls.length === 0) return null;

    const rows = allRowEls
      .map((el) => {
        const taskId = el.dataset.taskId;
        const depthRaw = el.dataset.taskDepth;
        if (!taskId || !depthRaw) return null;
        const depth = Number.parseInt(depthRaw, 10);
        if (!Number.isFinite(depth)) return null;
        const task = allTasks[taskId];
        if (!task || task.deletedAt) return null;
        return { el, taskId, depth, task };
      })
      .filter(Boolean) as Array<{ el: HTMLElement; taskId: string; depth: number; task: Task }>;

    if (rows.length === 0) return null;

    const pointEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const hoveredEl = pointEl?.closest?.('[data-task-id][data-task-depth]') as HTMLElement | null;
    const hoveredTaskId = hoveredEl?.dataset.taskId;
    const hoveredIndex = hoveredTaskId ? rows.findIndex((r) => r.taskId === hoveredTaskId) : -1;

    const draggedDepth = draggedTask.depth;

    let anchorIndex = hoveredIndex >= 0 ? hoveredIndex : 0;
    if (hoveredIndex >= 0 && rows[hoveredIndex].depth > draggedDepth) {
      for (let i = hoveredIndex; i >= 0; i -= 1) {
        if (rows[i].depth === draggedDepth) {
          anchorIndex = i;
          break;
        }
        if (rows[i].depth < draggedDepth) {
          anchorIndex = i;
          break;
        }
      }
    }

    const anchorTask = rows[anchorIndex]?.task ?? draggedTask;
    const targetParentId = anchorTask.parentId ?? null;

    const siblingRoots: Array<{ el: HTMLElement; taskId: string; rowIndex: number }> = [];
    rows.forEach((row, rowIndex) => {
      if (row.depth !== draggedDepth) return;
      if ((row.task.parentId ?? null) !== targetParentId) return;
      siblingRoots.push({ el: row.el, taskId: row.taskId, rowIndex });
    });

    if (siblingRoots.length === 0) return null;

    const wrapperRect = container.getBoundingClientRect();

    const boundaryClientYs: number[] = siblingRoots.map((r) => r.el.getBoundingClientRect().top);

    // last boundary = bottom of last sibling root's subtree
    const lastRoot = siblingRoots[siblingRoots.length - 1];
    let lastRowIndex = lastRoot.rowIndex;
    for (let i = lastRoot.rowIndex + 1; i < rows.length; i += 1) {
      if (rows[i].depth <= draggedDepth) break;
      lastRowIndex = i;
    }
    boundaryClientYs.push(rows[lastRowIndex].el.getBoundingClientRect().bottom);

    const clientY = e.clientY;

    let boundaryIndex = 0;

    if (siblingRoots.length === 2 && (draggedTask.parentId ?? null) === targetParentId) {
      const delta = clientY - (dragging?.startClientY ?? clientY);
      boundaryIndex = delta > 0 ? 2 : 0;
    } else {
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < boundaryClientYs.length; i += 1) {
        const d = Math.abs(clientY - boundaryClientYs[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      boundaryIndex = best;
    }

    const y = boundaryClientYs[boundaryIndex] - wrapperRect.top;

    const containerIds =
      targetParentId && allTasks[targetParentId] ? allTasks[targetParentId].childIds : rootTaskIds;

    let indexInContainer = -1;
    if (boundaryIndex < siblingRoots.length) {
      const beforeId = siblingRoots[boundaryIndex]?.taskId;
      if (beforeId) indexInContainer = containerIds.indexOf(beforeId);
    } else {
      const lastSiblingId = siblingRoots[siblingRoots.length - 1]?.taskId;
      if (lastSiblingId) {
        const lastIndex = containerIds.indexOf(lastSiblingId);
        indexInContainer = lastIndex >= 0 ? lastIndex + 1 : containerIds.length;
      }
    }

    if (indexInContainer < 0) return null;

    const draggedIndex = containerIds.indexOf(draggedId);
    let adjustedIndex = indexInContainer;
    if (draggedIndex >= 0 && adjustedIndex > draggedIndex) adjustedIndex -= 1;

    return { y, index: adjustedIndex, parentId: targetParentId, draggedId };
  };

  return (
    <div className="group/section">
      <TaskSectionHeader
        title={title}
        count={tasks.length}
        isCollapsed={isCollapsed}
        onToggle={() => toggleSection(id)}
      />

      {!isCollapsed && (
        <div
          ref={rootListRef}
          className="relative"
          onDragEnterCapture={(e) => {
            const types = Array.from(e.dataTransfer.types);
            if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;
            dragDepthRef.current += 1;

            if (e.shiftKey) {
              setDropIndicatorY(null);
              return;
            }

            const drop = computeReorderDrop(e);
            if (!drop) return;
            e.preventDefault();
            setDropIndicatorY((prev) => (prev === drop.y ? prev : drop.y));
          }}
          onDragOverCapture={(e) => {
            if (e.shiftKey) {
              setDropIndicatorY(null);
              return;
            }

            const drop = computeReorderDrop(e);
            if (!drop) return;
            e.preventDefault();

            setDropIndicatorY((prev) => (prev === drop.y ? prev : drop.y));
          }}
          onDragLeaveCapture={(e) => {
            const types = Array.from(e.dataTransfer.types);
            if (!types.includes('application/x-nexdo-task-id') && !types.includes('text/plain')) return;

            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) {
              setDropIndicatorY(null);
              useUIStore.getState().clearDraggingTask();
            }
          }}
          onDropCapture={(e) => {
            const drop = computeReorderDrop(e);
            dragDepthRef.current = 0;
            setDropIndicatorY(null);
            useUIStore.getState().clearDraggingTask();

            if (!drop) return;

            e.preventDefault();
            e.stopPropagation();
            moveTask(drop.draggedId, drop.parentId, drop.index);
          }}
        >
          {draggingTask && dropIndicatorY !== null && (
            <div
              className="pointer-events-none absolute left-6 right-6 h-0.5 bg-indigo-500"
              style={{ top: dropIndicatorY - 1 }}
            />
          )}

          {rootTasks.map((task, index) =>
            renderTaskTree(task, allTasks, index === rootTasks.length - 1)
          )}
        </div>
      )}
    </div>
  );
}
