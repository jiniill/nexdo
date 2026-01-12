import { useTaskStore } from '../store';
import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/task/TaskInput';
import { TaskList } from '../components/task/TaskList';
import { FloatingInput } from '../components/task/TaskInput';

export default function Today() {
  const tasks = useTaskStore((s) => s.getTodayTasks());

  return (
    <>
      <Header
        breadcrumbs={[{ label: '오늘 할 일' }]}
        showViewSwitcher={false}
      />
      <FilterBar />
      <div className="flex-1 relative overflow-hidden">
        <TaskList tasks={tasks} groupBy="none" />
        <FloatingInput />
      </div>
    </>
  );
}
