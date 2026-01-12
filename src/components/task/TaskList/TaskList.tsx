import { useMemo } from 'react';
import { useTaskStore } from '../../../store';
import type { Task } from '../../../types';
import { TaskSection } from './TaskSection';
import { isThisWeek, parseISO, isPast, isFuture } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  groupBy?: 'dueDate' | 'status' | 'none';
}

export function TaskList({ tasks, groupBy = 'dueDate' }: TaskListProps) {
  const allTasks = useTaskStore((s) => s.tasks);

  const sections = useMemo(() => {
    if (groupBy === 'none') {
      return [{ id: 'all', title: 'All Tasks', tasks }];
    }

    if (groupBy === 'dueDate') {
      const thisWeek: Task[] = [];
      const overdue: Task[] = [];
      const upcoming: Task[] = [];
      const noDue: Task[] = [];

      tasks.forEach((task) => {
        if (!task.dueDate) {
          noDue.push(task);
        } else {
          const date = parseISO(task.dueDate);
          if (isPast(date) && task.statusId !== 'done') {
            overdue.push(task);
          } else if (isThisWeek(date)) {
            thisWeek.push(task);
          } else if (isFuture(date)) {
            upcoming.push(task);
          } else {
            noDue.push(task);
          }
        }
      });

      const result = [];
      if (overdue.length > 0) {
        result.push({ id: 'overdue', title: 'Overdue', tasks: overdue });
      }
      if (thisWeek.length > 0) {
        result.push({ id: 'this-week', title: '이번 주 마감', tasks: thisWeek });
      }
      if (upcoming.length > 0) {
        result.push({ id: 'upcoming', title: 'Upcoming', tasks: upcoming });
      }
      if (noDue.length > 0) {
        result.push({ id: 'backlog', title: 'Backlog', tasks: noDue });
      }
      return result;
    }

    if (groupBy === 'status') {
      const byStatus: Record<string, Task[]> = {};
      tasks.forEach((task) => {
        if (!byStatus[task.statusId]) {
          byStatus[task.statusId] = [];
        }
        byStatus[task.statusId].push(task);
      });

      return Object.entries(byStatus).map(([statusId, statusTasks]) => ({
        id: statusId,
        title: statusId.charAt(0).toUpperCase() + statusId.slice(1).replace('-', ' '),
        tasks: statusTasks,
      }));
    }

    return [{ id: 'all', title: 'All Tasks', tasks }];
  }, [tasks, groupBy]);

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 pt-20">
        <div className="text-center">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm">Add a task to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white pb-24 scrollbar-thin">
      {sections.map((section) => (
        <TaskSection
          key={section.id}
          id={section.id}
          title={section.title}
          tasks={section.tasks}
          allTasks={allTasks}
        />
      ))}
    </div>
  );
}
