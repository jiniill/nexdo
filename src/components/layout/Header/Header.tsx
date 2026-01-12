import { Bell } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { ViewSwitcher } from './ViewSwitcher';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  breadcrumbs?: { label: string; to?: string }[];
  status?: string;
  showViewSwitcher?: boolean;
}

export function Header({
  breadcrumbs = [{ label: 'Home' }],
  status,
  showViewSwitcher = true,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 bg-white z-10">
      {/* Left: Breadcrumbs & View Switcher */}
      <div className="flex items-center gap-4">
        <Breadcrumbs items={breadcrumbs} status={status} />
        {showViewSwitcher && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <ViewSwitcher />
          </>
        )}
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-3">
        <SearchBar />
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
