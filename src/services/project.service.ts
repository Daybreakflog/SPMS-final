import { http } from '@/api/request';
import type { PageResult, Project, ProjectUser, ProjectListParams, ProjectCreateDTO, ProjectUpdateDTO, ProjectAssignUsersDTO } from '@/types';

export const projectService = {
  list: (params: ProjectListParams) =>
    http.get<PageResult<Project>>('/projects', params),

  detail: (id: string) =>
    http.get<Project>(`/projects/${id}`),

  create: (data: ProjectCreateDTO) =>
    http.post<Project>('/projects', data),

  update: (id: string, data: ProjectUpdateDTO) =>
    http.patch<Project>(`/projects/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`/projects/${id}`),

  // ⚠ GET /projects/{id}/users 后端不存在（Swagger 该路径只有 PUT）。
  //   暂时返回空数组，待后端补充 GET 接口后恢复。
  getUsers: (id: string): Promise<ProjectUser[]> => {
    void id;
    return Promise.resolve([]);
  },

  assignUsers: (id: string, data: ProjectAssignUsersDTO) =>
    http.put<void>(`/projects/${id}/users`, data),
};
