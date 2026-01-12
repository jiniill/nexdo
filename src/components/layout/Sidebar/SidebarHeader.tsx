import { Check, ChevronsLeft } from 'lucide-react';
import { useUIStore } from '../../../store';

export function SidebarHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="h-14 flex items-center px-4 border-b border-slate-200/50">
      <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900">
        <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center text-white">
          <Check className="w-4 h-4" />
        </div>
        NexDo
      </div>
      <button
        onClick={toggleSidebar}
        className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
