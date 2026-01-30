import { createWithEqualityFn as create } from 'zustand/traditional';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { TimeSession } from '../types';
import { timeRepository } from '../data/repositories';

interface TimeState {
  sessions: TimeSession[];

  addSession: (session: Omit<TimeSession, 'id'> & { id?: string }) => string | null;
  clearAll: () => void;
  clearTask: (taskId: string) => void;
}

export const useTimeStore = create<TimeState>()(
  immer((set) => {
    const initial = timeRepository.load();

    return {
      sessions: initial.sessions,

      addSession: (session) => {
        const startedMs = Date.parse(session.startedAt);
        const endedMs = Date.parse(session.endedAt);
        if (!Number.isFinite(startedMs) || !Number.isFinite(endedMs)) return null;
        const durationSeconds = Math.max(0, Math.floor(session.durationSeconds));
        if (durationSeconds <= 0) return null;

        const id = session.id ?? uuidv4();

        set((state) => {
          state.sessions.unshift({
            id,
            taskId: session.taskId,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            durationSeconds,
          });
        });

        return id;
      },

      clearAll: () => {
        set((state) => {
          state.sessions = [];
        });
      },

      clearTask: (taskId) => {
        set((state) => {
          state.sessions = state.sessions.filter((s) => s.taskId !== taskId);
        });
      },
    };
  })
);

if (typeof window !== 'undefined') {
  useTimeStore.subscribe((state) => {
    timeRepository.save({ sessions: state.sessions });
  });
}

