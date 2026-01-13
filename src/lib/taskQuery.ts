import type { Priority, Task } from '../types';

export type TaskSort = 'manual' | 'due-date' | 'priority' | 'created' | 'alphabetical' | 'assignee';

export interface TaskQuery {
  statusIds: string[];
  priorities: Priority[];
  assigneeId: string | null;
  sort: TaskSort;
}

const priorityRank: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

function compareString(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function compareDateAsc(a?: string, b?: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function compareDateDesc(a?: string, b?: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return b.localeCompare(a);
}

export function applyTaskQuery(
  tasks: Task[],
  query: TaskQuery
): Task[] {
  const filtered = tasks.filter((task) => {
    if (task.deletedAt) return false;
    if (query.statusIds.length > 0 && !query.statusIds.includes(task.statusId)) {
      return false;
    }
    if (query.priorities.length > 0 && !query.priorities.includes(task.priority)) {
      return false;
    }
    if (query.assigneeId && !task.assigneeIds.includes(query.assigneeId)) {
      return false;
    }
    return true;
  });

  if (query.sort === 'manual') {
    return filtered;
  }

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (query.sort === 'due-date') {
      const due = compareDateAsc(a.dueDate, b.dueDate);
      if (due !== 0) return due;
      return compareDateDesc(a.createdAt, b.createdAt);
    }
    if (query.sort === 'priority') {
      const pr = priorityRank[a.priority] - priorityRank[b.priority];
      if (pr !== 0) return pr;
      return compareDateDesc(a.createdAt, b.createdAt);
    }
    if (query.sort === 'created') {
      return compareDateDesc(a.createdAt, b.createdAt);
    }
    if (query.sort === 'alphabetical') {
      const t = compareString(a.title, b.title);
      if (t !== 0) return t;
      return compareDateDesc(a.createdAt, b.createdAt);
    }
    if (query.sort === 'assignee') {
      const aa = a.assigneeIds[0] ?? '';
      const bb = b.assigneeIds[0] ?? '';
      const c = compareString(aa, bb);
      if (c !== 0) return c;
      return compareDateDesc(a.createdAt, b.createdAt);
    }
    return 0;
  });

  return sorted;
}
