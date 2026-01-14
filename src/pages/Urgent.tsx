import { useMemo } from 'react';
import { useTaskStore, useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { PageBody } from '../components/layout/PageBody';

export default function Urgent() {
  const tasks = useTaskStore((s) =>
    Object.values(s.tasks).filter(
      (t) => !t.parentId && !t.deletedAt && (t.priority === 'urgent' || t.priority === 'high')
    )
  );
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
        breadcrumbs={[{ label: '긴급 / 중요' }]}
        showViewSwitcher={false}
      />
      <FilterBar />
      <PageBody>
        <TaskList tasks={visibleTasks} groupBy="dueDate" />
        <FloatingInput />
      </PageBody>
    </>
  );
}
