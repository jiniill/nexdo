import { createWithEqualityFn as create } from 'zustand/traditional';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths, addWeeks, format, isValid, parseISO } from 'date-fns';
import { DEFAULT_STATUSES, type RecurrenceRule, type Task, type Priority } from '../types';
import { useActivityStore } from './activityStore';
import { useUserStore } from './userStore';
import { taskRepository } from '../data/repositories';

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
      assigneeIds?: string[];
      labels?: string[];
      recurrence?: RecurrenceRule;
    }
  ) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void; // soft delete
  restoreTask: (id: string) => void;
  hardDeleteTask: (id: string) => void;
  detachProject: (projectId: string) => void;
  ensureProjectStatusIds: (projectId: string, validStatusIds: string[], fallbackStatusId: string) => void;
  toggleComplete: (id: string) => void;
  startTracking: (id: string) => void;
  stopTracking: (id: string) => void;
  toggleTracking: (id: string) => void;
  moveTask: (id: string, newParentId: string | null, index?: number) => void;

  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getChildTasks: (parentId: string) => Task[];
  getRootTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getInboxTasks: () => Task[];
  getTodayTasks: () => Task[];
  getDeletedRootTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  immer((set, get) => {
    const initial = taskRepository.load();

    return {
      tasks: initial.tasks,
      rootTaskIds: initial.rootTaskIds,

      addTask: (title, options = {}) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const {
          parentId,
          projectId,
          priority = 'none',
          dueDate,
          description,
          assigneeIds = [],
          labels = [],
          recurrence,
        } = options;

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
            assigneeIds,
            labels,
            recurrence,
          };

          state.tasks[id] = newTask;

          if (parentId && state.tasks[parentId]) {
            state.tasks[parentId].childIds.push(id);
          } else {
            state.rootTaskIds.push(id);
          }
        });

        useActivityStore.getState().addActivity({
          taskId: id,
          type: 'created',
          actorUserId: useUserStore.getState().currentUserId,
        });

        return id;
      },

      updateTask: (id, updates) => {
        const previous = get().tasks[id];
        if (!previous) return;

        const previousStatusId = previous.statusId;
        const actorUserId = useUserStore.getState().currentUserId;

        set((state) => {
          if (state.tasks[id]) {
            state.tasks[id] = {
              ...state.tasks[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        if (updates.statusId && updates.statusId !== previousStatusId) {
          useActivityStore.getState().addActivity({
            taskId: id,
            type: 'status_change',
            actorUserId,
            fromStatusId: previousStatusId,
            toStatusId: updates.statusId,
          });
        }

        const has = (key: keyof Task) => Object.prototype.hasOwnProperty.call(updates, key);

        const changes: string[] = [];

        if (has('title') && updates.title !== undefined && updates.title !== previous.title) {
          changes.push(`title: "${previous.title}" → "${updates.title}"`);
        }

        if (has('description') && updates.description !== previous.description) {
          changes.push(
            `description: ${previous.description ? 'set' : 'empty'} → ${updates.description ? 'set' : 'empty'}`
          );
        }

        if (has('priority') && updates.priority !== previous.priority) {
          changes.push(`priority: ${previous.priority} → ${updates.priority}`);
        }

        if (has('dueDate') && updates.dueDate !== previous.dueDate) {
          changes.push(`due date: ${previous.dueDate ?? 'none'} → ${updates.dueDate ?? 'none'}`);
        }

        if (has('assigneeIds')) {
          const next = updates.assigneeIds ?? [];
          const prev = previous.assigneeIds ?? [];
          const equal =
            next.length === prev.length && next.every((v, idx) => v === prev[idx]);
          if (!equal) {
            changes.push(`assignees: ${prev.length} → ${next.length}`);
          }
        }

        if (has('estimatedMinutes')) {
          const prev = previous.estimatedMinutes;
          const next = updates.estimatedMinutes;
          if (prev !== next) {
            changes.push(`estimate: ${prev ?? 'none'} → ${next ?? 'none'}`);
          }
        }

        if (changes.length > 0) {
          useActivityStore.getState().addActivity({
            taskId: id,
            type: 'updated',
            actorUserId,
            content: changes.join('\n'),
          });
        }
      },

      deleteTask: (id) => {
        const now = new Date().toISOString();

        set((state) => {
          const markRecursive = (taskId: string) => {
            const task = state.tasks[taskId];
            if (!task) return;

            task.deletedAt = now;
            task.updatedAt = now;
            task.childIds.forEach(markRecursive);
          };

          markRecursive(id);
        });
      },

      restoreTask: (id) => {
        const now = new Date().toISOString();

        set((state) => {
          const restoreRecursive = (taskId: string) => {
            const task = state.tasks[taskId];
            if (!task) return;

            delete task.deletedAt;
            task.updatedAt = now;
            task.childIds.forEach(restoreRecursive);
          };

          restoreRecursive(id);
        });
      },

      hardDeleteTask: (id) => {
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

            useActivityStore.getState().clearTask(taskId);
            delete state.tasks[taskId];
          };

          deleteRecursive(id);
        });
      },

      detachProject: (projectId) => {
        const validStatusIds = new Set(DEFAULT_STATUSES.map((s) => s.id));
        const now = new Date().toISOString();

        set((state) => {
          Object.values(state.tasks).forEach((task) => {
            if (task.projectId !== projectId) return;
            task.projectId = undefined;
            if (!validStatusIds.has(task.statusId)) {
              task.statusId = 'todo';
              task.completedAt = undefined;
            }
            task.updatedAt = now;
          });
        });
      },

      ensureProjectStatusIds: (projectId, validStatusIds, fallbackStatusId) => {
        const valid = new Set(validStatusIds);
        const now = new Date().toISOString();

        set((state) => {
          Object.values(state.tasks).forEach((task) => {
            if (task.deletedAt) return;
            if (task.projectId !== projectId) return;
            if (!valid.has(task.statusId)) {
              task.statusId = fallbackStatusId;
              task.updatedAt = now;
            }
          });
        });
      },

      toggleComplete: (id) => {
        const task = get().tasks[id];
        if (!task) return;
        const wasDone = task.statusId === 'done';
        const shouldSpawnNext = !wasDone && !!task.recurrence;
        const wasTracking = !!task.trackingStartedAt;

        set((state) => {
          const draft = state.tasks[id];
          if (!draft) return;

          const newStatus = wasDone ? 'todo' : 'done';
          const now = new Date().toISOString();

          const markDoneRecursive = (taskId: string) => {
            const t = state.tasks[taskId];
            if (!t) return;
            if (t.deletedAt) return;
            const alreadyDone = t.statusId === 'done';
            t.statusId = 'done';
            t.updatedAt = now;
            if (!alreadyDone) {
              t.completedAt = now;
            }

            if (t.trackingStartedAt) {
              const startedMs = Date.parse(t.trackingStartedAt);
              if (Number.isFinite(startedMs)) {
                const deltaSec = Math.max(0, Math.floor((Date.parse(now) - startedMs) / 1000));
                t.trackedSeconds = (t.trackedSeconds ?? 0) + deltaSec;
              }
              t.trackingStartedAt = undefined;
            }
            t.childIds.forEach(markDoneRecursive);
          };

          const markTodo = (taskId: string) => {
            const t = state.tasks[taskId];
            if (!t) return;
            if (t.deletedAt) return;
            t.statusId = 'todo';
            t.completedAt = undefined;
            t.updatedAt = now;
          };

          if (newStatus === 'done') {
            markDoneRecursive(id);

            // If a task is done, and all visible siblings are done, auto-complete ancestors.
            let parentId = state.tasks[id]?.parentId ?? null;
            while (parentId) {
              const parent = state.tasks[parentId];
              if (!parent) break;
              if (parent.deletedAt) break;

              const visibleChildIds = parent.childIds.filter((cid) => {
                const child = state.tasks[cid];
                return !!child && !child.deletedAt;
              });

              if (visibleChildIds.length === 0) break;
              const allDone = visibleChildIds.every((cid) => state.tasks[cid]?.statusId === 'done');
              if (!allDone) break;

              const parentAlreadyDone = parent.statusId === 'done';
              parent.statusId = 'done';
              parent.updatedAt = now;
              if (!parentAlreadyDone) {
                parent.completedAt = now;
              }

              parentId = parent.parentId ?? null;
            }
          } else {
            markTodo(id);

            // If a task is reopened, its ancestors can't be done.
            let parentId = state.tasks[id]?.parentId ?? null;
            while (parentId) {
              const parent = state.tasks[parentId];
              if (!parent) break;
              if (parent.deletedAt) break;
              if (parent.statusId === 'done') {
                parent.statusId = 'todo';
                parent.completedAt = undefined;
                parent.updatedAt = now;
              }
              parentId = parent.parentId ?? null;
            }
          }
        });

        if (shouldSpawnNext) {
          const current = get().tasks[id];
          if (current && current.recurrence) {
            const nextDueDate = (() => {
              const base = current.dueDate && isValid(parseISO(current.dueDate)) ? parseISO(current.dueDate) : new Date();
              const interval = Math.max(1, current.recurrence.interval || 1);
              const next =
                current.recurrence.frequency === 'daily'
                  ? addDays(base, interval)
                  : current.recurrence.frequency === 'weekly'
                    ? addWeeks(base, interval)
                    : addMonths(base, interval);

              const nextStr = format(next, 'yyyy-MM-dd');
              const end = current.recurrence.endDate;
              if (end && nextStr > end) return null;
              return nextStr;
            })();

            if (nextDueDate) {
              get().addTask(current.title, {
                parentId: current.parentId ?? undefined,
                projectId: current.projectId,
                priority: current.priority,
                dueDate: nextDueDate,
                description: current.description,
                assigneeIds: current.assigneeIds,
                labels: current.labels,
                recurrence: current.recurrence,
              });
            }
          }
        }

        useActivityStore.getState().addActivity({
          taskId: id,
          type: wasDone ? 'reopened' : 'completed',
          actorUserId: useUserStore.getState().currentUserId,
        });

        if (!wasDone && wasTracking) {
          useActivityStore.getState().addActivity({
            taskId: id,
            type: 'tracking_stopped',
            actorUserId: useUserStore.getState().currentUserId,
          });
        }
      },

      startTracking: (id) => {
        const nowIso = new Date().toISOString();
        const nowMs = Date.now();
        const actorUserId = useUserStore.getState().currentUserId;
        const stoppedIds: string[] = [];
        let didStart = false;

        set((state) => {
          const target = state.tasks[id];
          if (!target) return;
          if (target.deletedAt) return;
          if (target.trackingStartedAt) return;

          // Stop any other running timers to keep single-active tracking.
          Object.values(state.tasks).forEach((t) => {
            if (!t.trackingStartedAt) return;
            if (t.deletedAt) {
              t.trackingStartedAt = undefined;
              return;
            }
            const startedMs = Date.parse(t.trackingStartedAt);
            if (!Number.isFinite(startedMs)) {
              t.trackingStartedAt = undefined;
              t.updatedAt = nowIso;
              return;
            }
            const deltaSec = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
            t.trackedSeconds = (t.trackedSeconds ?? 0) + deltaSec;
            t.trackingStartedAt = undefined;
            t.updatedAt = nowIso;
            stoppedIds.push(t.id);
          });

          target.trackingStartedAt = nowIso;
          target.trackedSeconds = target.trackedSeconds ?? 0;
          target.updatedAt = nowIso;
          didStart = true;
        });

        if (didStart) {
          stoppedIds.forEach((taskId) => {
            if (taskId === id) return;
            useActivityStore.getState().addActivity({ taskId, type: 'tracking_stopped', actorUserId });
          });
          useActivityStore.getState().addActivity({ taskId: id, type: 'tracking_started', actorUserId });
        }
      },

      stopTracking: (id) => {
        const nowIso = new Date().toISOString();
        const nowMs = Date.now();
        const actorUserId = useUserStore.getState().currentUserId;
        let didStop = false;

        set((state) => {
          const task = state.tasks[id];
          if (!task) return;
          if (!task.trackingStartedAt) return;

          const startedMs = Date.parse(task.trackingStartedAt);
          if (!Number.isFinite(startedMs)) {
            task.trackingStartedAt = undefined;
            task.updatedAt = nowIso;
            return;
          }

          const deltaSec = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
          task.trackedSeconds = (task.trackedSeconds ?? 0) + deltaSec;
          task.trackingStartedAt = undefined;
          task.updatedAt = nowIso;
          didStop = true;
        });

        if (didStop) {
          useActivityStore.getState().addActivity({ taskId: id, type: 'tracking_stopped', actorUserId });
        }
      },

      toggleTracking: (id) => {
        const task = get().tasks[id];
        if (!task) return;
        if (task.trackingStartedAt) {
          get().stopTracking(id);
          return;
        }
        get().startTracking(id);
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
        return Object.values(state.tasks).filter((t) => t.projectId === projectId && !t.deletedAt);
      },

      getInboxTasks: () => {
        const state = get();
        return Object.values(state.tasks).filter((t) => !t.projectId && !t.parentId && !t.deletedAt);
      },

      getTodayTasks: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return Object.values(state.tasks).filter(
          (t) => t.dueDate && t.dueDate.startsWith(today) && t.statusId !== 'done' && !t.deletedAt
        );
      },

      getDeletedRootTasks: () => {
        const state = get();
        return state.rootTaskIds.map((id) => state.tasks[id]).filter((t) => !!t?.deletedAt);
      },
    };
  })
);

if (typeof window !== 'undefined') {
  useTaskStore.subscribe((state) => {
    taskRepository.save({ tasks: state.tasks, rootTaskIds: state.rootTaskIds });
  });
}
