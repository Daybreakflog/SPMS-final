import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';
import { storage } from '@/utils/storage';

const CURRENT_PROJECT_KEY = 'current_project';

export interface ProjectInfo {
  id: string;
  name: string;
}

interface ProjectState {
  currentProject: ProjectInfo | null;
  setCurrentProject: (project: ProjectInfo | null, queryClient?: QueryClient) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: storage.get<ProjectInfo>(CURRENT_PROJECT_KEY),

  setCurrentProject: (project, queryClient) => {
    if (project) {
      storage.set(CURRENT_PROJECT_KEY, project);
    } else {
      storage.remove(CURRENT_PROJECT_KEY);
    }
    set({ currentProject: project });
    // 切换项目时清除相关 query 缓存，避免跨项目数据串扰
    if (queryClient) {
      queryClient.removeQueries({ predicate: () => true });
    }
  },
}));
