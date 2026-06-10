import type { PageParams } from './common';

export interface CompanyListParams extends PageParams {
  name?: string;
  // 后端 status 为数字：1 启用 / 0 禁用
  status?: number;
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
