import { createWithEqualityFn as create } from 'zustand/traditional';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../types';
import { DEFAULT_STATUSES } from '../types';
import { projectRepository } from '../data/repositories';

interface ProjectState {
  projects: Record<string, Project>;

  addProject: (name: string, color?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getAllProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => {
    const initial = projectRepository.load();

    return {
      projects: initial.projects,

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
    };
  })
);

if (typeof window !== 'undefined') {
  useProjectStore.subscribe((state) => {
    projectRepository.save({ projects: state.projects });
  });
}
