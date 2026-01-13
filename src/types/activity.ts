export type TaskActivityType =
  | 'created'
  | 'comment'
  | 'status_change'
  | 'completed'
  | 'reopened'
  | 'updated';

export interface TaskActivity {
  id: string;
  taskId: string;
  type: TaskActivityType;
  actorUserId: string;
  createdAt: string;

  content?: string;
  fromStatusId?: string;
  toStatusId?: string;
}
