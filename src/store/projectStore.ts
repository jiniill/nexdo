import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../types';
import { DEFAULT_STATUSES } from '../types';

interface ProjectState {
  projects: Record<string, Project>;

  addProject: (name: string, color?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getAllProjects: () => Project[];
}

// 기본 프로젝트 데이터
const defaultProjects: Record<string, Project> = {
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
};

export const useProjectStore = create<ProjectState>()(
  persist(
    immer((set, get) => ({
      projects: defaultProjects,

      addProject: (name, color = 'blue') => {
        const id = uuidv4();
        const now = new Date().toISOString();

        set((state) => {
          state.projects[id] = {
            id,
            name,
            color,
            statuses: DEFAULT_STATUSES,
            createdAt: now,
            updatedAt: now,
          };
        });

        return id;
      },

      updateProject: (id, updates) => {
        set((state) => {
          if (state.projects[id]) {
            state.projects[id] = {
              ...state.projects[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });
      },

      deleteProject: (id) => {
        set((state) => {
          delete state.projects[id];
        });
      },

      getProjectById: (id) => get().projects[id],

      getAllProjects: () => Object.values(get().projects),
    })),
    { name: 'nexdo-projects' }
  )
);
