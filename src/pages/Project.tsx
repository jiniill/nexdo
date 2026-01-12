import { useParams } from 'react-router-dom';
import { useTaskStore, useProjectStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore((s) => (projectId ? s.projects[projectId] : null));
  const tasks = useTaskStore((s) => (projectId ? s.getTasksByProject(projectId) : []));

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
      <FilterBar />
      <div className="flex-1 relative overflow-hidden">
        <TaskList tasks={tasks} groupBy="dueDate" />
        <FloatingInput projectId={projectId} />
      </div>
    </>
  );
}
