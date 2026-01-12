import { GripVertical } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useTaskStore, useUIStore } from '../../../store';
import { DEFAULT_STATUSES } from '../../../types';
import type { Task } from '../../../types';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskContent } from './TaskContent';
import { TaskProgress } from './TaskProgress';
import { TaskMeta } from './TaskMeta';
import { TreeConnector } from './TreeConnector';

interface TaskItemProps {
  task: Task;
  isLast?: boolean;
}

export function TaskItem({ task, isLast = false }: TaskItemProps) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const openInspector = useUIStore((s) => s.openInspector);
  const tasks = useTaskStore((s) => s.tasks);

  const isCompleted = task.statusId === 'done';
  const status = DEFAULT_STATUSES.find((s) => s.id === task.statusId) || DEFAULT_STATUSES[0];

  // 서브태스크 진행률 계산
  const completedChildren = task.childIds.filter(
    (id) => tasks[id]?.statusId === 'done'
  ).length;

  const handleClick = () => {
    openInspector(task.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-3 px-6 py-2.5 border-b border-slate-100',
        'hover:bg-slate-50 transition-colors cursor-pointer relative',
        isCompleted && 'opacity-60 hover:opacity-100'
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
      <div className="absolute left-1.5 opacity-0 group-hover:opacity-100 cursor-grab text-slate-300">
        <GripVertical className="w-4 h-4" />
      </div>

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
        {task.childIds.length > 0 && !isCompleted && (
          <TaskProgress
            completed={completedChildren}
            total={task.childIds.length}
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
