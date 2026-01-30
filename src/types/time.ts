export interface TimeSession {
  id: string;
  taskId: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationSeconds: number;
}

