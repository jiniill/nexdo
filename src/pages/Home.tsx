import { useTaskStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';

export default function Home() {
  const tasks = useTaskStore((s) => Object.values(s.tasks).filter((t) => !t.parentId));

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'All Tasks' }]}
        showViewSwitcher={true}
      />
      <FilterBar />
      <div className="flex-1 relative overflow-hidden">
        <TaskList tasks={tasks} groupBy="dueDate" />
        <FloatingInput />
      </div>
    </>
  );
}
