import { createWithEqualityFn as create } from 'zustand/traditional';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { activityRepository } from '../data/repositories';
import type { TaskActivity } from '../types';

interface ActivityState {
  activitiesByTaskId: Record<string, TaskActivity[]>;

  getTaskActivities: (taskId: string) => TaskActivity[];
  addComment: (taskId: string, actorUserId: string, content: string) => string | null;
  addActivity: (activity: Omit<TaskActivity, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => string;
  clearTask: (taskId: string) => void;
}

export const useActivityStore = create<ActivityState>()(
  immer((set, get) => {
    const initial = activityRepository.load();

    return {
      activitiesByTaskId: initial.activitiesByTaskId,

      getTaskActivities: (taskId) => get().activitiesByTaskId[taskId] ?? [],

      addComment: (taskId, actorUserId, content) => {
        const trimmed = content.trim();
        if (!trimmed) return null;

        const id = uuidv4();
        const createdAt = new Date().toISOString();

        set((state) => {
          const list = state.activitiesByTaskId[taskId] ?? [];
          state.activitiesByTaskId[taskId] = [
            { id, taskId, type: 'comment', actorUserId, createdAt, content: trimmed },
            ...list,
          ];
        });

        return id;
      },

      addActivity: (activity) => {
        const id = activity.id ?? uuidv4();
        const createdAt = activity.createdAt ?? new Date().toISOString();

        set((state) => {
          const list = state.activitiesByTaskId[activity.taskId] ?? [];
          state.activitiesByTaskId[activity.taskId] = [
            { ...activity, id, createdAt },
            ...list,
          ];
        });

        return id;
      },

      clearTask: (taskId) => {
        set((state) => {
          delete state.activitiesByTaskId[taskId];
        });
      },
    };
  })
);

if (typeof window !== 'undefined') {
  useActivityStore.subscribe((state) => {
    activityRepository.save({ activitiesByTaskId: state.activitiesByTaskId });
  });
}
