import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function PageBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 relative overflow-hidden', className)} {...props} />;
}

