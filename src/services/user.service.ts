import { http } from '@/api/request';
import type { PageResult, StaffUser, UserListParams, UserCreateDTO, UserUpdateDTO, UserAssignRolesDTO, UserAssignProjectsDTO, AssignUserProjectsDTO, ChangePasswordDTO } from '@/types';
import type { RoleCode } from '@/types/enums';

type RawRole = RoleCode | { role?: RoleCode; name?: string; label?: string; id?: unknown };
type RawProjectId = string | { id: string; name?: string; label?: string };

export function normalizeRoles(roles: unknown[]): RoleCode[] {
  return (roles ?? []).flatMap((r): RoleCode[] => {
    if (typeof r === 'string') return [r as RoleCode];
    if (r && typeof r === 'object') {
      const obj = r as Record<string, unknown>;
      const code =
        (typeof obj.role === 'string' ? obj.role : undefined) ??
        (typeof obj.code === 'string' ? obj.code : undefined) ??
        (typeof obj.name === 'string' ? obj.name : undefined);
      if (code !== undefined) return [code as RoleCode];
    }
    return [];
  });
}

export function normalizeProjectIds(projectIds: RawProjectId[]): string[] {
  return projectIds.map((p) => (typeof p === 'string' ? p : p.id));
}

export function normalizeUser<T extends { roles: RawRole[]; projectIds: RawProjectId[] }>(
  user: T,
): Omit<T, 'roles' | 'projectIds'> & { roles: RoleCode[]; projectIds: string[] } {
  return {
    ...user,
    roles: normalizeRoles(user.roles),
    projectIds: normalizeProjectIds(user.projectIds),
  };
}

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

  changePassword: (id: string, data: ChangePasswordDTO) =>
    http.patch<void>(`/users/${id}`, { password: data.newPassword }),
};
