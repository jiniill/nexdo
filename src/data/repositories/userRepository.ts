import type { User } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';

export interface UserRepoState {
  users: Record<string, User>;
  currentUserId: string;
}

const STORAGE_KEY = 'nexdo-users';

const fallbackState: UserRepoState = {
  users: {
    me: { id: 'me', name: '김개발', email: 'me@example.com' },
    kim: { id: 'kim', name: 'Kim', email: 'kim@example.com' },
    park: { id: 'park', name: 'Park', email: 'park@example.com' },
    lee: { id: 'lee', name: 'Lee', email: 'lee@example.com' },
  },
  currentUserId: 'me',
};

export const userRepository = {
  load(): UserRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: UserRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};

