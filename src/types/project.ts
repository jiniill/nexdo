import type { Status } from './status';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  statuses: Status[];
  createdAt: string;
  updatedAt: string;
}
