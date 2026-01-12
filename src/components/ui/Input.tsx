import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  shortcut?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, shortcut, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-500 transition-colors">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-slate-50 border border-slate-200 rounded-md text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'transition-all placeholder:text-slate-400',
            icon ? 'pl-9' : 'pl-3',
            shortcut ? 'pr-16' : 'pr-3',
            'py-1.5',
            className
          )}
          {...props}
        />
        {shortcut && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
              {shortcut}
            </kbd>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
