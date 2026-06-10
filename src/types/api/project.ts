import type { PageParams } from './common';

export interface ProjectListParams extends PageParams {
  keyword?: string;
  companyId?: string;
  // 后端 status 为数字：1 启用 / 0 禁用
  status?: number;
}

export interface ProjectCreateDTO {
  name: string;
  code: string;
  companyId?: string;
  address?: string;
  description?: string;
  status?: number;
}

export type ProjectUpdateDTO = Partial<ProjectCreateDTO>;

export interface ProjectAssignUsersDTO {
  userIds: string[];
}
