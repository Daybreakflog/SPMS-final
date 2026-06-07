import { http } from '@/api/request';
import type { PageResult, StaffUser, UserListParams, UserCreateDTO, UserUpdateDTO, UserAssignRolesDTO, UserAssignProjectsDTO, AssignUserProjectsDTO, ChangePasswordDTO } from '@/types';

export const userService = {
  list: (params: UserListParams) =>
    http.get<PageResult<StaffUser>>('/users', params),

  detail: (id: string) =>
    http.get<StaffUser>(`/users/${id}`),

  create: (data: UserCreateDTO) =>
    http.post<StaffUser>('/users', data),

  update: (id: string, data: UserUpdateDTO) =>
    http.patch<StaffUser>(`/users/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`/users/${id}`),

  assignRoles: (id: string, data: UserAssignRolesDTO) =>
    http.put<void>(`/users/${id}/roles`, data),

  assignProjects: (id: string, data: UserAssignProjectsDTO) =>
    http.put<void>(`/users/${id}/projects`, data),

  batchAssignProjects: (data: AssignUserProjectsDTO) =>
    http.put<void>('/projects/assign-user-projects', data),

  changePassword: (data: ChangePasswordDTO) =>
    http.post<void>('/users/change-password', data),
};
