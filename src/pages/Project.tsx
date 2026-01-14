import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskStore, useProjectStore, useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { TaskBoard } from '../components/task/TaskBoard';
import { TaskGantt } from '../components/task/TaskGantt';
import { TaskCalendar } from '../components/task/TaskCalendar';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';
import { PageBody } from '../components/layout/PageBody';
import { EmptyState } from '../components/ui';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore((s) => (projectId ? s.projects[projectId] : null));
  const tasks = useTaskStore((s) => (projectId ? s.getTasksByProject(projectId) : []));
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

  if (!project) {
    return (
      <EmptyState title="Project not found" />
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Projects', to: '/' },
          { label: project.name },
        ]}
        status="IN PROGRESS"
        showViewSwitcher={true}
      />
      <FilterBar projectId={projectId} />
      <PageBody>
        {viewMode === 'list' && <TaskList tasks={visibleTasks} groupBy="dueDate" />}
        {viewMode === 'board' && <TaskBoard tasks={visibleTasks} statuses={project.statuses} />}
        {viewMode === 'calendar' && <TaskCalendar tasks={visibleTasks} />}
        {viewMode === 'gantt' && <TaskGantt tasks={visibleTasks} />}
        <FloatingInput projectId={projectId} />
      </PageBody>
    </>
  );
}
