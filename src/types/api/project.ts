import type { PageParams } from './common';

export interface ProjectListParams extends PageParams {
  keyword?: string;
  companyId?: string;
  status?: string;
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
