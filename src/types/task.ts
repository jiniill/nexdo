export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;

  // 계층 구조
  parentId: string | null;
  childIds: string[];
  depth: number;

  // 상태
  statusId: string;
  priority: Priority;

  // 시간
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  dueDate?: string;
  completedAt?: string;

  // 반복
  recurrence?: RecurrenceRule;

  // 프로젝트 & 메타
  projectId?: string;
  assigneeIds: string[];
  labels: string[];
}

export type TaskCreate = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'childIds' | 'depth'>;
