import type { PageParams } from './common';

export interface CompanyListParams extends PageParams {
  name?: string;
  creditCode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CompanyCreateDTO {
  name: string;
  creditCode?: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  remark?: string;
}

export type CompanyUpdateDTO = Partial<CompanyCreateDTO>;
