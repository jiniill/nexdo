import { createWithEqualityFn as create } from 'zustand/traditional';
import type { Priority } from '../types';
import type { TaskSort } from '../lib/taskQuery';
import { uiRepository, type ViewMode } from '../data/repositories';

type ContextMenuTarget =
  | { kind: 'task'; taskId: string }
  | { kind: 'app' };

interface UIState {
  // 사이드바
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // 인스펙터
  inspectorOpen: boolean;
  selectedTaskId: string | null;
  openInspector: (taskId: string) => void;
  closeInspector: () => void;

  // 뷰 모드
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // 섹션 접힘 상태
  collapsedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;

  // Task query (filter/sort)
  taskStatusFilters: string[];
  taskPriorityFilters: Priority[];
  taskAssigneeFilter: string | null;
  taskSort: TaskSort;
  setTaskSort: (sort: TaskSort) => void;
  toggleTaskStatusFilter: (statusId: string) => void;
  toggleTaskPriorityFilter: (priority: Priority) => void;
  setTaskAssigneeFilter: (userId: string | null) => void;
  clearTaskFilters: () => void;

  // Context menu
  contextMenu: { open: boolean; x: number; y: number; target: ContextMenuTarget | null };
  openContextMenu: (x: number, y: number, target: ContextMenuTarget) => void;
  closeContextMenu: () => void;

  // Drag & drop
  draggingTask: { taskId: string; startClientY: number } | null;
  setDraggingTask: (taskId: string, startClientY: number) => void;
  clearDraggingTask: () => void;
}

const initial = uiRepository.load();

export const useUIStore = create<UIState>((set) => ({
  // 사이드바
  sidebarCollapsed: initial.sidebarCollapsed ?? false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // 인스펙터
  inspectorOpen: false,
  selectedTaskId: null,
  openInspector: (taskId) => set({ inspectorOpen: true, selectedTaskId: taskId }),
  closeInspector: () => set({ inspectorOpen: false, selectedTaskId: null }),

  // 뷰 모드
  viewMode: initial.viewMode ?? 'list',
  setViewMode: (mode) => set({ viewMode: mode }),

  // 섹션 접힘 상태
  collapsedSections: initial.collapsedSections ?? {},
  toggleSection: (sectionId) =>
    set((state) => ({
      collapsedSections: {
        ...state.collapsedSections,
        [sectionId]: !state.collapsedSections[sectionId],
      },
    })),

  // Task query (filter/sort)
  taskStatusFilters: initial.taskStatusFilters ?? [],
  taskPriorityFilters: initial.taskPriorityFilters ?? [],
  taskAssigneeFilter: initial.taskAssigneeFilter ?? null,
  taskSort: initial.taskSort ?? 'due-date',
  setTaskSort: (sort) => set({ taskSort: sort }),
  toggleTaskStatusFilter: (statusId) =>
    set((state) => ({
      taskStatusFilters: state.taskStatusFilters.includes(statusId)
        ? state.taskStatusFilters.filter((id) => id !== statusId)
        : [...state.taskStatusFilters, statusId],
    })),
  toggleTaskPriorityFilter: (priority) =>
    set((state) => ({
      taskPriorityFilters: state.taskPriorityFilters.includes(priority)
        ? state.taskPriorityFilters.filter((p) => p !== priority)
        : [...state.taskPriorityFilters, priority],
    })),
  setTaskAssigneeFilter: (userId) => set({ taskAssigneeFilter: userId }),
  clearTaskFilters: () =>
    set({
      taskStatusFilters: [],
      taskPriorityFilters: [],
      taskAssigneeFilter: null,
    }),

  // Context menu
  contextMenu: { open: false, x: 0, y: 0, target: null },
  openContextMenu: (x, y, target) => set({ contextMenu: { open: true, x, y, target } }),
  closeContextMenu: () => set({ contextMenu: { open: false, x: 0, y: 0, target: null } }),

  // Drag & drop
  draggingTask: null,
  setDraggingTask: (taskId, startClientY) => set({ draggingTask: { taskId, startClientY } }),
  clearDraggingTask: () => set({ draggingTask: null }),
}));

if (typeof window !== 'undefined') {
  useUIStore.subscribe((state) => {
    uiRepository.save({
      sidebarCollapsed: state.sidebarCollapsed,
      viewMode: state.viewMode as ViewMode,
      collapsedSections: state.collapsedSections,
      taskStatusFilters: state.taskStatusFilters,
      taskPriorityFilters: state.taskPriorityFilters,
      taskAssigneeFilter: state.taskAssigneeFilter,
      taskSort: state.taskSort,
    });
  });
}
