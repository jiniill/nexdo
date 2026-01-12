import { Filter, ArrowUpDown } from 'lucide-react';
import { AvatarStack } from '../../ui';

export function FilterBar() {
  const viewers = [
    { name: 'User A' },
    { name: 'User B' },
    { name: 'User C' },
    { name: 'User D' },
  ];

  return (
    <div className="h-12 border-b border-slate-200 flex items-center px-6 gap-3 bg-white">
      <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-all">
        <Filter className="w-3.5 h-3.5" />
        Filter
      </button>
      <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-all">
        <ArrowUpDown className="w-3.5 h-3.5" />
        Sort
      </button>
      <div className="h-4 w-px bg-slate-200" />
      <div className="flex items-center gap-2">
        <AvatarStack avatars={viewers} max={3} size="sm" />
        <span className="text-xs text-slate-400">{viewers.length} viewing</span>
      </div>
    </div>
  );
}
