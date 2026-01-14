import { useMemo } from 'react';
import { isPast, parseISO } from 'date-fns';
import { useTaskStore, useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { PageBody } from '../components/layout/PageBody';

export default function Overdue() {
  const tasks = useTaskStore((s) =>
    Object.values(s.tasks).filter((t) => {
      if (t.deletedAt) return false;
      if (t.parentId) return false;
      if (!t.dueDate) return false;
      if (t.statusId === 'done') return false;
      return isPast(parseISO(t.dueDate));
    })
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
        breadcrumbs={[{ label: 'Overdue' }]}
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
