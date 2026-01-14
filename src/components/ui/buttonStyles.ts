import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'neutral';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700',
  ghost: 'hover:bg-slate-100 text-slate-600',
  success: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200',
  danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
  neutral: 'bg-slate-900 text-white hover:bg-slate-800',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs gap-1.5',
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

export function getButtonClassName({
  variant,
  size,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );
}

