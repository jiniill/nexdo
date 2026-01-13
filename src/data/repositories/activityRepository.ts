import type { TaskActivity } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';

export interface ActivityRepoState {
  activitiesByTaskId: Record<string, TaskActivity[]>;
}

const STORAGE_KEY = 'nexdo-activities';

const fallbackState: ActivityRepoState = {
  activitiesByTaskId: {},
};

export const activityRepository = {
  load(): ActivityRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: ActivityRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};
