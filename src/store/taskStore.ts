import { createWithEqualityFn as create } from 'zustand/traditional';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Priority } from '../types';

interface TaskState {
  tasks: Record<string, Task>;
  rootTaskIds: string[];

  // Actions
  addTask: (
    title: string,
    options?: {
      parentId?: string;
      projectId?: string;
      priority?: Priority;
      dueDate?: string;
      description?: string;
    }
  ) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  moveTask: (id: string, newParentId: string | null, index?: number) => void;

  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getChildTasks: (parentId: string) => Task[];
  getRootTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getInboxTasks: () => Task[];
  getTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set, get) => ({
      tasks: {},
      rootTaskIds: [],

      addTask: (title, options = {}) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const { parentId, projectId, priority = 'none', dueDate, description } = options;

        set((state) => {
          const depth = parentId ? (state.tasks[parentId]?.depth ?? 0) + 1 : 0;

          const newTask: Task = {
            id,
            title,
            description,
            parentId: parentId ?? null,
            childIds: [],
            depth,
            statusId: 'todo',
            priority,
            createdAt: now,
            updatedAt: now,
            dueDate,
            projectId,
            assigneeIds: [],
            labels: [],
          };

          state.tasks[id] = newTask;

          if (parentId && state.tasks[parentId]) {
            state.tasks[parentId].childIds.push(id);
          } else {
            state.rootTaskIds.push(id);
          }
        });

        return id;
      },

      updateTask: (id, updates) => {
        set((state) => {
          if (state.tasks[id]) {
            state.tasks[id] = {
              ...state.tasks[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const deleteRecursive = (taskId: string) => {
            const task = state.tasks[taskId];
            if (!task) return;

            // 자식들 먼저 삭제
            task.childIds.forEach(deleteRecursive);

            // 부모에서 제거
            if (task.parentId && state.tasks[task.parentId]) {
              const parent = state.tasks[task.parentId];
              parent.childIds = parent.childIds.filter((cid) => cid !== taskId);
            } else {
              state.rootTaskIds = state.rootTaskIds.filter((rid) => rid !== taskId);
            }

            delete state.tasks[taskId];
          };

          deleteRecursive(id);
        });
      },

      toggleComplete: (id) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return;

          const isDone = task.statusId === 'done';
          const newStatus = isDone ? 'todo' : 'done';
          const now = new Date().toISOString();

          task.statusId = newStatus;
          task.updatedAt = now;
          task.completedAt = isDone ? undefined : now;
        });
      },

      moveTask: (id, newParentId, index) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return;

          // 순환 참조 방지
          if (newParentId) {
            let current = newParentId;
            while (current) {
              if (current === id) return;
              current = state.tasks[current]?.parentId ?? '';
            }
          }

          // 기존 부모에서 제거
          if (task.parentId && state.tasks[task.parentId]) {
            const oldParent = state.tasks[task.parentId];
            oldParent.childIds = oldParent.childIds.filter((cid) => cid !== id);
          } else {
            state.rootTaskIds = state.rootTaskIds.filter((rid) => rid !== id);
          }

          // 새 부모에 추가
          task.parentId = newParentId;
          task.depth = newParentId ? (state.tasks[newParentId]?.depth ?? 0) + 1 : 0;

          if (newParentId && state.tasks[newParentId]) {
            const newParent = state.tasks[newParentId];
            if (index !== undefined) {
              newParent.childIds.splice(index, 0, id);
            } else {
              newParent.childIds.push(id);
            }
          } else {
            if (index !== undefined) {
              state.rootTaskIds.splice(index, 0, id);
            } else {
              state.rootTaskIds.push(id);
            }
          }

          // 자식들의 depth 업데이트
          const updateChildDepths = (taskId: string, parentDepth: number) => {
            const t = state.tasks[taskId];
            if (!t) return;
            t.depth = parentDepth + 1;
            t.childIds.forEach((cid) => updateChildDepths(cid, t.depth));
          };
          task.childIds.forEach((cid) => updateChildDepths(cid, task.depth));
        });
      },

      getTaskById: (id) => get().tasks[id],

      getChildTasks: (parentId) => {
        const state = get();
        const parent = state.tasks[parentId];
        if (!parent) return [];
        return parent.childIds.map((id) => state.tasks[id]).filter(Boolean);
      },

      getRootTasks: () => {
        const state = get();
        return state.rootTaskIds.map((id) => state.tasks[id]).filter(Boolean);
      },

      getTasksByProject: (projectId) => {
        const state = get();
        return Object.values(state.tasks).filter((t) => t.projectId === projectId);
      },

      getInboxTasks: () => {
        const state = get();
        return Object.values(state.tasks).filter((t) => !t.projectId && !t.parentId);
      },

      getTodayTasks: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return Object.values(state.tasks).filter(
          (t) => t.dueDate && t.dueDate.startsWith(today) && t.statusId !== 'done'
        );
      },
    })),
    { name: 'nexdo-tasks' }
  )
);
