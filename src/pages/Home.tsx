import { useTaskStore } from '../store';
import { useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { useMemo } from 'react';

export default function Home() {
  const tasks = useTaskStore((s) => Object.values(s.tasks).filter((t) => !t.parentId && !t.deletedAt));
  const taskStatusFilters = useUIStore((s) => s.taskStatusFilters);
  const taskPriorityFilters = useUIStore((s) => s.taskPriorityFilters);
  const taskAssigneeFilter = useUIStore((s) => s.taskAssigneeFilter);
  const taskSort = useUIStore((s) => s.taskSort);

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
        <TaskList tasks={visibleTasks} groupBy="dueDate" />
        <FloatingInput />
      </div>
    </>
  );
}
