import { useMemo } from 'react';
import { useTaskStore, useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { PageBody } from '../components/layout/PageBody';

export default function Today() {
  const tasks = useTaskStore((s) => s.getTodayTasks());
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
        breadcrumbs={[{ label: '오늘 할 일' }]}
        showViewSwitcher={false}
      />
      <FilterBar />
      <PageBody>
        <TaskList tasks={visibleTasks} groupBy="none" />
        <FloatingInput />
      </PageBody>
    </>
  );
}
