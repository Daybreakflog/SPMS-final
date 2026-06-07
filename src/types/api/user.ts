import type { PageParams } from './common';
import type { RoleCode } from '../enums';

export interface UserListParams extends PageParams {
  keyword?: string;
  roles?: RoleCode[];
  projectId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserCreateDTO {
  username: string;
  realName: string;
  password: string;
  phone: string;
  email?: string;
  department?: string;
  roles: RoleCode[];
  projectIds?: string[];
  status?: string;
  remark?: string;
}

export interface UserUpdateDTO {
  realName?: string;
  phone?: string;
  email?: string;
  department?: string;
  status?: string;
  remark?: string;
}

export interface UserAssignRolesDTO {
  roles: RoleCode[];
}

export interface UserAssignProjectsDTO {
  projectIds: string[];
}

export interface AssignUserProjectsDTO {
  userId: string;
  projectIds: string[];
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
