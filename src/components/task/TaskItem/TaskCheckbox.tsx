import { Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}

export function TaskCheckbox({ checked, onChange, size = 'md' }: TaskCheckboxProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'transition-colors flex-shrink-0',
        checked
          ? 'text-primary-500 hover:text-primary-700'
          : 'text-slate-300 hover:text-primary-600'
      )}
    >
      {checked ? (
        <CheckCircle2 className={sizeClass} />
      ) : (
        <Circle className={sizeClass} />
      )}
    </button>
  );
}
