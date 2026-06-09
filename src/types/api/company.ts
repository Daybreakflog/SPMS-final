import type { PageParams } from './common';

export interface CompanyListParams extends PageParams {
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CompanyCreateDTO {
  name: string;
  code: string;
  contact: string;
  phone: string;
  address?: string;
}

export type CompanyUpdateDTO = Partial<CompanyCreateDTO>;
