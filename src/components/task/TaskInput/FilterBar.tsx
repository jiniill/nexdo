import { useState, useRef, useEffect } from 'react';
import { Filter, ArrowUpDown, Check, X, ChevronDown } from 'lucide-react';
import { AvatarStack } from '../../ui';
import { cn } from '../../../lib/cn';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface SortOption {
  id: string;
  label: string;
}

export function FilterBar() {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'status-todo', label: 'Todo', checked: false },
    { id: 'status-in-progress', label: 'In Progress', checked: false },
    { id: 'status-done', label: 'Done', checked: false },
    { id: 'priority-high', label: 'High Priority', checked: false },
    { id: 'priority-urgent', label: 'Urgent', checked: false },
    { id: 'assigned-me', label: 'Assigned to me', checked: false },
  ]);
  const [currentSort, setCurrentSort] = useState<string>('due-date');

  const sortOptions: SortOption[] = [
    { id: 'due-date', label: 'Due Date' },
    { id: 'priority', label: 'Priority' },
    { id: 'created', label: 'Created Date' },
    { id: 'alphabetical', label: 'Alphabetical' },
    { id: 'assignee', label: 'Assignee' },
  ];

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = filters.filter(f => f.checked).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilter = (id: string) => {
    setFilters(prev => prev.map(f =>
      f.id === id ? { ...f, checked: !f.checked } : f
    ));
  };

  const clearFilters = () => {
    setFilters(prev => prev.map(f => ({ ...f, checked: false })));
  };

  const viewers = [
    { name: 'User A' },
    { name: 'User B' },
    { name: 'User C' },
    { name: 'User D' },
  ];

  return (
    <div className="h-12 border-b border-slate-200 flex items-center px-6 gap-3 bg-white">
      {/* Filter Button & Dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => {
            setShowFilterMenu(!showFilterMenu);
            setShowSortMenu(false);
          }}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border transition-all',
            activeFilterCount > 0
              ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
              : 'text-slate-600 hover:bg-slate-100 border-transparent hover:border-slate-200'
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn(
            'w-3 h-3 transition-transform',
            showFilterMenu && 'rotate-180'
          )} />
        </button>

        {showFilterMenu && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
              {filters.slice(0, 3).map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    filter.checked ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {filter.label}
                  </span>
                  {filter.checked && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priority</div>
              {filters.slice(3, 5).map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    filter.checked ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {filter.label}
                  </span>
                  {filter.checked && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assignee</div>
              {filters.slice(5).map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    filter.checked ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {filter.label}
                  </span>
                  {filter.checked && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Button & Dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => {
            setShowSortMenu(!showSortMenu);
            setShowFilterMenu(false);
          }}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border transition-all',
            'text-slate-600 hover:bg-slate-100 border-transparent hover:border-slate-200'
          )}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort
          <span className="text-slate-400 font-normal">
            : {sortOptions.find(s => s.id === currentSort)?.label}
          </span>
          <ChevronDown className={cn(
            'w-3 h-3 transition-transform',
            showSortMenu && 'rotate-180'
          )} />
        </button>

        {showSortMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by</span>
            </div>
            <div className="py-1">
              {sortOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    setCurrentSort(option.id);
                    setShowSortMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    currentSort === option.id ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {option.label}
                  </span>
                  {currentSort === option.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200" />

      <div className="flex items-center gap-2">
        <AvatarStack avatars={viewers} max={3} size="sm" />
        <span className="text-xs text-slate-400">{viewers.length} viewing</span>
      </div>
    </div>
  );
}
