import { List, Kanban, Calendar } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useUIStore } from '../../../store';

type ViewMode = 'list' | 'board' | 'gantt';

const views: { id: ViewMode; icon: typeof List; label: string }[] = [
  { id: 'list', icon: List, label: 'List' },
  { id: 'board', icon: Kanban, label: 'Board' },
  { id: 'gantt', icon: Calendar, label: 'Gantt' },
];

export function ViewSwitcher() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);

  return (
    <div className="flex p-0.5 bg-slate-100 rounded-lg">
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setViewMode(id)}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors',
            viewMode === id
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
