import type { Priority } from '../../types';
import type { TaskSort } from '../../lib/taskQuery';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';

export type ViewMode = 'list' | 'board' | 'gantt';

export interface UIRepoState {
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  collapsedSections: Record<string, boolean>;
  taskStatusFilters: string[];
  taskPriorityFilters: Priority[];
  taskAssigneeFilter: string | null;
  taskSort: TaskSort;
}

const STORAGE_KEY = 'nexdo-ui';

const fallbackState: UIRepoState = {
  sidebarCollapsed: false,
  viewMode: 'list',
  collapsedSections: {},
  taskStatusFilters: [],
  taskPriorityFilters: [],
  taskAssigneeFilter: null,
  taskSort: 'due-date',
};

export const uiRepository = {
  load(): UIRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: UIRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};

