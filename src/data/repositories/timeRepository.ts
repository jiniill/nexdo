import type { TimeSession } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';

export interface TimeRepoState {
  sessions: TimeSession[];
}

const STORAGE_KEY = 'nexdo-time-sessions';

const fallbackState: TimeRepoState = {
  sessions: [],
};

export const timeRepository = {
  load(): TimeRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: TimeRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};

