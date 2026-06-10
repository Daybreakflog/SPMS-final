import type { PageParams } from './common';
import type { RoleCode } from '../enums';

export interface UserListParams extends PageParams {
  keyword?: string;
  roles?: RoleCode[];
  projectId?: string;
  companyId?: string;
  // 后端 status 为数字：1 启用 / 0 禁用
  status?: number;
  startDate?: string;
  endDate?: string;
}

// 对应后端 CreateUserDto
// ⚠ 后端 DTO **不包含** department / remark —— 部门、备注字段后端没建模
export interface UserCreateDTO {
  username: string;
  password: string;
  realName: string;
  phone?: string;
  companyId?: string;
  roles?: RoleCode[];
  projectIds?: string[];
  status?: number;
}

// 对应后端 UpdateUserDto
export interface UserUpdateDTO {
  username?: string;
  password?: string;
  realName?: string;
  phone?: string;
  companyId?: string;
  roles?: RoleCode[];
  projectIds?: string[];
  status?: number;
}

// 对应后端 AssignRolesDto
export interface UserAssignRolesDTO {
  roles: RoleCode[];
}

// 对应后端 AssignProjectsDto
export interface UserAssignProjectsDTO {
  projectIds: string[];
}

// 对应后端 AssignUserProjectsDto —— PUT /projects/assign-user-projects
export interface AssignUserProjectsDTO {
  userId: string;
  projectIds: string[];
}

// 对应后端 AssignProjectUsersDto —— PUT /projects/:id/users
export interface AssignProjectUsersDTO {
  userIds: string[];
}

/**
 * ⚠ 后端 **没有** `POST /users/change-password` 接口 ——
 * 当前 user.service.ts 里的 changePassword() 调用会 404。
 * 改密码请走 `PATCH /users/:id` 传 `{password}`，或登录后让后端补这个接口。
 */
export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
