import { useTaskStore } from '../store';
import { useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { TaskBoard } from '../components/task/TaskBoard';
import { TaskGantt } from '../components/task/TaskGantt';
import { TaskCalendar } from '../components/task/TaskCalendar';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { DEFAULT_STATUSES } from '../types';
import { useMemo } from 'react';
import { PageBody } from '../components/layout/PageBody';

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
      <PageBody>
        {viewMode === 'list' && <TaskList tasks={visibleTasks} groupBy="dueDate" />}
        {viewMode === 'board' && <TaskBoard tasks={visibleTasks} statuses={DEFAULT_STATUSES} />}
        {viewMode === 'calendar' && <TaskCalendar tasks={visibleTasks} />}
        {viewMode === 'gantt' && <TaskGantt tasks={visibleTasks} />}
        <FloatingInput />
      </PageBody>
    </>
  );
}
