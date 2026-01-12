import { useTaskStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';

export default function Inbox() {
  const tasks = useTaskStore((s) => s.getInboxTasks());

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Inbox' }]}
        showViewSwitcher={false}
      />
      <FilterBar />
      <div className="flex-1 relative overflow-hidden">
        <TaskList tasks={tasks} groupBy="dueDate" />
        <FloatingInput />
      </div>
    </>
  );
}
