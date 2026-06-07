import { http } from '@/api/request';
import type { PageResult, Company, CompanyListParams, CompanyCreateDTO, CompanyUpdateDTO } from '@/types';

export const companyService = {
  list: (params: CompanyListParams) =>
    http.get<PageResult<Company>>('/platform/companies', params),

  detail: (id: string) =>
    http.get<Company>(`/platform/companies/${id}`),

  create: (data: CompanyCreateDTO) =>
    http.post<Company>('/platform/companies', data),

  update: (id: string, data: CompanyUpdateDTO) =>
    http.patch<Company>(`/platform/companies/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`/platform/companies/${id}`),
};
