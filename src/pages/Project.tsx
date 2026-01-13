import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskStore, useProjectStore, useUIStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { TaskBoard } from '../components/task/TaskBoard';
import { FloatingInput } from '../components/task/TaskInput';
import { applyTaskQuery } from '../lib/taskQuery';

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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Project not found</p>
      </div>
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
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'list' && <TaskList tasks={visibleTasks} groupBy="dueDate" />}
        {viewMode === 'board' && <TaskBoard tasks={visibleTasks} statuses={project.statuses} />}
        {viewMode === 'gantt' && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-lg font-medium">Gantt view</p>
              <p className="text-sm">Coming soon</p>
            </div>
          </div>
        )}
        <FloatingInput projectId={projectId} />
      </div>
    </>
  );
}
