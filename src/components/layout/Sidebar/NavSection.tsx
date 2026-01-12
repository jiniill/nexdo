import { Plus } from 'lucide-react';
import { type ReactNode } from 'react';

interface NavSectionProps {
  title: string;
  children: ReactNode;
  onAdd?: () => void;
}

export function NavSection({ title, children, onAdd }: NavSectionProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-2 py-1 group cursor-pointer">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {onAdd && (
          <button
            onClick={onAdd}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
