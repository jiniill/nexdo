export type TaskActivityType =
  | 'created'
  | 'comment'
  | 'status_change'
  | 'completed'
  | 'reopened'
  | 'updated'
  | 'tracking_started'
  | 'tracking_stopped';

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
