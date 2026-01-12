import { ChevronDown, ChevronRight } from 'lucide-react';

interface TaskSectionHeaderProps {
  title: string;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TaskSectionHeader({
  title,
  count,
  isCollapsed,
  onToggle,
}: TaskSectionHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
      <button
        onClick={onToggle}
        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {title}
      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-normal">
        {count}
      </span>
      <div className="h-px bg-slate-100 flex-1 ml-2" />
    </div>
  );
}
