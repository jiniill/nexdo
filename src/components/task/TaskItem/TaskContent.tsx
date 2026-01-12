import { cn } from '../../../lib/cn';
import { PriorityBadge } from '../../ui';
import type { Priority } from '../../../types';

interface TaskContentProps {
  title: string;
  priority: Priority;
  isCompleted: boolean;
}

export function TaskContent({ title, priority, isCompleted }: TaskContentProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'text-sm font-medium',
          isCompleted
            ? 'text-slate-500 line-through decoration-slate-400'
            : 'text-slate-900'
        )}
      >
        {title}
      </span>
      {!isCompleted && <PriorityBadge priority={priority} />}
    </div>
  );
}
