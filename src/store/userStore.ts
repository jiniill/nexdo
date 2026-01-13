import { createWithEqualityFn as create } from 'zustand/traditional';
import { immer } from 'zustand/middleware/immer';
import type { User } from '../types';
import { userRepository } from '../data/repositories';

interface UserState {
  users: Record<string, User>;
  currentUserId: string;

  setCurrentUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;
  getAllUsers: () => User[];
}

export const useUserStore = create<UserState>()(
  immer((set, get) => {
    const initial = userRepository.load();

    return {
      users: initial.users,
      currentUserId: initial.currentUserId,

      setCurrentUser: (userId) => {
        if (!get().users[userId]) return;
        set({ currentUserId: userId });
      },

      getUserById: (userId) => get().users[userId],
      getAllUsers: () => Object.values(get().users),
    };
  })
);

if (typeof window !== 'undefined') {
  useUserStore.subscribe((state) => {
    userRepository.save({ users: state.users, currentUserId: state.currentUserId });
  });
}
