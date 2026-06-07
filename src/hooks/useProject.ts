import { useProjectStore } from '@/store/project.store';

export function useCurrentProject() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  return { currentProject, setCurrentProject };
}
