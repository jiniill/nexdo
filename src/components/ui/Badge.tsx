import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-bold',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// 우선순위 전용 배지
interface PriorityBadgeProps {
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  className?: string;
}

const priorityConfig = {
  urgent: { label: 'Urgent', variant: 'error' as const },
  high: { label: 'P1', variant: 'warning' as const },
  medium: { label: 'P2', variant: 'primary' as const },
  low: { label: 'P3', variant: 'default' as const },
  none: null,
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  if (!config) return null;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// 상태 배지
interface StatusBadgeProps {
  statusId: string;
  statusName: string;
  color?: string;
  className?: string;
}

export function StatusBadge({ statusName, color = 'slate', className }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  const dotColorMap: Record<string, string> = {
    slate: 'bg-slate-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border border-slate-200',
        colorMap[color] || colorMap.slate,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColorMap[color] || dotColorMap.slate)} />
      {statusName}
    </span>
  );
}
