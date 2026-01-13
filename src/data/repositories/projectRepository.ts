import type { Project } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../localStorage';
import { DEFAULT_STATUSES } from '../../types';

export interface ProjectRepoState {
  projects: Record<string, Project>;
}

const STORAGE_KEY = 'nexdo-projects';

const fallbackState: ProjectRepoState = {
  projects: {
    'q1-launch': {
      id: 'q1-launch',
      name: 'Q1 제품 런칭',
      color: 'blue',
      statuses: DEFAULT_STATUSES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    marketing: {
      id: 'marketing',
      name: '마케팅 리브랜딩',
      color: 'emerald',
      statuses: DEFAULT_STATUSES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'design-system': {
      id: 'design-system',
      name: '디자인 시스템 2.0',
      color: 'purple',
      statuses: DEFAULT_STATUSES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export const projectRepository = {
  load(): ProjectRepoState {
    return loadFromLocalStorage(STORAGE_KEY, fallbackState);
  },
  save(state: ProjectRepoState) {
    saveToLocalStorage(STORAGE_KEY, state, 1);
  },
};

