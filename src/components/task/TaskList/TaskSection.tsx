import React from 'react';
import { useUIStore } from '../../../store';
import type { Task } from '../../../types';
import { TaskItem } from '../TaskItem';
import { TaskSectionHeader } from './TaskSectionHeader';

interface TaskSectionProps {
  id: string;
  title: string;
  tasks: Task[];
  allTasks: Record<string, Task>;
}

// 재귀적으로 태스크와 자식들을 렌더링
function renderTaskTree(
  task: Task,
  allTasks: Record<string, Task>,
  isLast: boolean
): React.ReactNode[] {
  const elements: React.ReactNode[] = [
    <TaskItem key={task.id} task={task} isLast={isLast} />,
  ];

  task.childIds.forEach((childId, index) => {
    const child = allTasks[childId];
    if (child) {
      const isLastChild = index === task.childIds.length - 1;
      elements.push(...renderTaskTree(child, allTasks, isLastChild));
    }
  });

  return elements;
}

export function TaskSection({ id, title, tasks, allTasks }: TaskSectionProps) {
  const isCollapsed = useUIStore((s) => s.collapsedSections[id] ?? false);
  const toggleSection = useUIStore((s) => s.toggleSection);

  // 루트 태스크만 필터 (자식이 아닌 것)
  const rootTasks = tasks.filter((t) => !t.parentId);

  return (
    <div className="group/section">
      <TaskSectionHeader
        title={title}
        count={tasks.length}
        isCollapsed={isCollapsed}
        onToggle={() => toggleSection(id)}
      />

      {!isCollapsed && (
        <div>
          {rootTasks.map((task, index) =>
            renderTaskTree(task, allTasks, index === rootTasks.length - 1)
          )}
        </div>
      )}
    </div>
  );
}
