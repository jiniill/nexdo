import { useTaskStore } from '../store';
import { useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { TaskBoard } from '../components/task/TaskBoard';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { DEFAULT_STATUSES } from '../types';
import { useMemo } from 'react';

export default function Home() {
  const tasks = useTaskStore((s) => Object.values(s.tasks).filter((t) => !t.parentId && !t.deletedAt));
  const taskStatusFilters = useUIStore((s) => s.taskStatusFilters);
  const taskPriorityFilters = useUIStore((s) => s.taskPriorityFilters);
  const taskAssigneeFilter = useUIStore((s) => s.taskAssigneeFilter);
  const taskSort = useUIStore((s) => s.taskSort);
  const viewMode = useUIStore((s) => s.viewMode);

  const visibleTasks = useMemo(
    () =>
      applyTaskQuery(tasks, {
        statusIds: taskStatusFilters,
        priorities: taskPriorityFilters,
        assigneeId: taskAssigneeFilter,
        sort: taskSort,
      }),
    [taskAssigneeFilter, taskPriorityFilters, taskSort, taskStatusFilters, tasks]
  );

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'All Tasks' }]}
        showViewSwitcher={true}
      />
      <FilterBar />
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'list' && <TaskList tasks={visibleTasks} groupBy="dueDate" />}
        {viewMode === 'board' && <TaskBoard tasks={visibleTasks} statuses={DEFAULT_STATUSES} />}
        {viewMode === 'gantt' && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-lg font-medium">Gantt view</p>
              <p className="text-sm">Coming soon</p>
            </div>
          </div>
        )}
        <FloatingInput />
      </div>
    </>
  );
}
