import { http } from '@/api/request';
import type { PageResult, StaffUser, UserListParams, UserCreateDTO, UserUpdateDTO, UserAssignRolesDTO, UserAssignProjectsDTO, AssignUserProjectsDTO, ChangePasswordDTO } from '@/types';
import type { RoleCode } from '@/types/enums';

// 后端 roles / projects 字段存在两种形态：
//   - 登录接口（/auth/staff/login）：roles 为扁平字符串数组 ["PLATFORM_ADMIN"]，projectIds 为字符串数组，
//     companyName 为顶层字段。
//   - 用户接口（/users、/users/:id）：roles 为 [{ roleId, role:{ name,label } }]，
//     没有 projectIds 字段（授权项目在 projects:[{ projectId, project:{ id,name } }] 里），
//     没有 companyName 字段（公司名在 company.name 里）。
//   normalize* 需同时兼容这两种形态，否则用户管理列表角色为空、编辑/详情会因 undefined.map 崩溃。
export function normalizeRoles(roles: unknown[] | undefined): RoleCode[] {
  return (roles ?? []).flatMap((r): RoleCode[] => {
    if (typeof r === 'string') return [r as RoleCode];
    if (r && typeof r === 'object') {
      const obj = r as Record<string, unknown>;
      // 嵌套形态：{ role: { name } }
      if (obj.role && typeof obj.role === 'object') {
        const nested = obj.role as Record<string, unknown>;
        const nm = nested.name ?? nested.code;
        if (typeof nm === 'string') return [nm as RoleCode];
      }
      const code =
        (typeof obj.role === 'string' ? obj.role : undefined) ??
        (typeof obj.code === 'string' ? obj.code : undefined) ??
        (typeof obj.name === 'string' ? obj.name : undefined);
      if (typeof code === 'string') return [code as RoleCode];
    }
    return [];
  });
}

export function normalizeProjectIds(projects: unknown[] | undefined): string[] {
  return (projects ?? []).flatMap((p): string[] => {
    if (typeof p === 'string') return [p];
    if (p && typeof p === 'object') {
      const obj = p as Record<string, unknown>;
      const id =
        (typeof obj.projectId === 'string' ? obj.projectId : undefined) ??
        (typeof obj.id === 'string' ? obj.id : undefined) ??
        (obj.project && typeof obj.project === 'object'
          ? ((obj.project as Record<string, unknown>).id as string | undefined)
          : undefined);
      if (typeof id === 'string') return [id];
    }
    return [];
  });
}

export function normalizeUser<
  T extends {
    roles?: unknown;
    projectIds?: unknown;
    projects?: unknown;
    companyName?: unknown;
    company?: unknown;
  },
>(user: T): Omit<T, 'roles' | 'projectIds' | 'companyName'> & {
  roles: RoleCode[];
  projectIds: string[];
  companyName: string;
} {
  const u = user as {
    roles?: unknown[];
    projectIds?: unknown[];
    projects?: unknown[];
    companyName?: string;
    company?: { name?: string };
  };
  return {
    ...user,
    roles: normalizeRoles(u.roles),
    // 优先用扁平 projectIds（登录态），否则从嵌套 projects 提取（用户接口）
    projectIds: normalizeProjectIds(u.projectIds ?? u.projects),
    // 用户接口无 companyName，公司名在 company.name 里
    companyName: u.companyName ?? u.company?.name ?? '',
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
