import type { Task } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';

export interface TaskRepoState {
  tasks: Record<string, Task>;
  rootTaskIds: string[];
}

const STORAGE_KEY = 'nexdo-tasks';

const fallbackState: TaskRepoState = {
  tasks: {},
  rootTaskIds: [],
};

export const taskRepository = {
  load(): TaskRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: TaskRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};

