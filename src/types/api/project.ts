import type { PageParams } from './common';

export interface ProjectListParams extends PageParams {
  name?: string;
  companyId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectCreateDTO {
  name: string;
  companyId?: string;
  address: string;
  manager?: string;
  contactPhone?: string;
  areaUnit?: string;
  billingStartDate?: string;
  remark?: string;
}

export type ProjectUpdateDTO = Partial<ProjectCreateDTO>;

export interface ProjectAssignUsersDTO {
  userIds: string[];
}
