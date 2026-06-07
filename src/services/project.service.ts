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

  getUsers: (id: string) =>
    http.get<ProjectUser[]>(`/projects/${id}/users`),

  assignUsers: (id: string, data: ProjectAssignUsersDTO) =>
    http.put<void>(`/projects/${id}/users`, data),
};
