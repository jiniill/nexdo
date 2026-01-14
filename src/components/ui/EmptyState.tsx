import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn('flex-1 flex items-center justify-center text-slate-400', className)}
      {...props}
    >
      <div className="text-center">
        {icon && <div className="mx-auto mb-2">{icon}</div>}
        <p className="text-lg font-medium">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
    </div>
  );
}
