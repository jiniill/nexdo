import { create } from 'zustand';

type ViewMode = 'list' | 'board' | 'gantt';

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
}

export const useUIStore = create<UIState>((set) => ({
  // 사이드바
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // 인스펙터
  inspectorOpen: false,
  selectedTaskId: null,
  openInspector: (taskId) => set({ inspectorOpen: true, selectedTaskId: taskId }),
  closeInspector: () => set({ inspectorOpen: false, selectedTaskId: null }),

  // 뷰 모드
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),

  // 섹션 접힘 상태
  collapsedSections: {},
  toggleSection: (sectionId) =>
    set((state) => ({
      collapsedSections: {
        ...state.collapsedSections,
        [sectionId]: !state.collapsedSections[sectionId],
      },
    })),
}));
