import { useMemo, useState, useRef, useEffect } from 'react';
import { Filter, ArrowUpDown, Check, X, ChevronDown, Columns3 } from 'lucide-react';
import { AvatarStack } from '../../ui';
import { cn } from '../../../lib/cn';
import { useProjectStore, useUIStore, useUserStore } from '../../../store';
import { DEFAULT_STATUSES, PRIORITY_CONFIG, type Priority, type Status } from '../../../types';
import type { TaskSort } from '../../../lib/taskQuery';
import { ProjectStatusModal } from './ProjectStatusModal';

interface SortOption {
  id: TaskSort;
  label: string;
}

export function FilterBar({ projectId }: { projectId?: string }) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStatuses, setShowStatuses] = useState(false);
  const taskStatusFilters = useUIStore((s) => s.taskStatusFilters);
  const taskPriorityFilters = useUIStore((s) => s.taskPriorityFilters);
  const taskAssigneeFilter = useUIStore((s) => s.taskAssigneeFilter);
  const taskSort = useUIStore((s) => s.taskSort);
  const setTaskSort = useUIStore((s) => s.setTaskSort);
  const toggleTaskStatusFilter = useUIStore((s) => s.toggleTaskStatusFilter);
  const toggleTaskPriorityFilter = useUIStore((s) => s.toggleTaskPriorityFilter);
  const setTaskAssigneeFilter = useUIStore((s) => s.setTaskAssigneeFilter);
  const clearTaskFilters = useUIStore((s) => s.clearTaskFilters);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const projectStatuses = useProjectStore((s) =>
    projectId ? s.projects[projectId]?.statuses : null
  );
  const statuses: Status[] = projectStatuses ?? DEFAULT_STATUSES;
  const orderedStatuses = useMemo(
    () => [...statuses].sort((a, b) => a.order - b.order),
    [statuses]
  );

  const sortOptions: SortOption[] = [
    { id: 'manual', label: 'Manual' },
    { id: 'due-date', label: 'Due Date' },
    { id: 'priority', label: 'Priority' },
    { id: 'created', label: 'Created Date' },
    { id: 'alphabetical', label: 'Alphabetical' },
    { id: 'assignee', label: 'Assignee' },
  ];

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const activeFilterCount =
    taskStatusFilters.length +
    taskPriorityFilters.length +
    (taskAssigneeFilter ? 1 : 0);

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

  const isAssignedToMe = taskAssigneeFilter === currentUserId;

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
                  onClick={clearTaskFilters}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</div>
              {orderedStatuses.map((status) => {
                const checked = taskStatusFilters.includes(status.id);
                return (
                <button
                  key={status.id}
                  onClick={() => toggleTaskStatusFilter(status.id)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    checked ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {status.name}
                  </span>
                  {checked && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
                );
              })}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priority</div>
              {(['urgent', 'high'] as Priority[]).map((p) => {
                const checked = taskPriorityFilters.includes(p);
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <button
                  key={p}
                  onClick={() => toggleTaskPriorityFilter(p)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    checked ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {cfg.label}
                  </span>
                  {checked && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
                );
              })}
              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assignee</div>
              <button
                  onClick={() => setTaskAssigneeFilter(isAssignedToMe ? null : currentUserId)}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    isAssignedToMe ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    Assigned to me
                  </span>
                  {isAssignedToMe && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
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
            : {sortOptions.find(s => s.id === taskSort)?.label}
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
                    setTaskSort(option.id);
                    setShowSortMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className={cn(
                    'transition-colors',
                    taskSort === option.id ? 'text-indigo-600 font-medium' : 'text-slate-600'
                  )}>
                    {option.label}
                  </span>
                  {taskSort === option.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200" />

      {projectId && (
        <>
          <button
            type="button"
            onClick={() => setShowStatuses(true)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border transition-all',
              'text-slate-600 hover:bg-slate-100 border-transparent hover:border-slate-200'
            )}
          >
            <Columns3 className="w-3.5 h-3.5" />
            Statuses
          </button>
          <div className="h-4 w-px bg-slate-200" />
        </>
      )}

      {taskSort === 'manual' && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            드래그: 순서 변경
          </span>
          <span className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
            Shift + Drop: 하위로 이동
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <AvatarStack avatars={viewers} max={3} size="sm" />
        <span className="text-xs text-slate-400">{viewers.length} viewing</span>
      </div>

      {projectId && showStatuses && (
        <ProjectStatusModal projectId={projectId} onClose={() => setShowStatuses(false)} />
      )}
    </div>
  );
}
