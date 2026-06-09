import { http } from '@/api/request';
import type {
  PageResult,
  Contract,
  ContractListParams,
  ContractCreateDTO,
  ContractApproveDTO,
  ContractRejectDTO,
  ContractTerminateDTO,
  ContractRenewDTO,
} from '@/types';

export const contractService = {
  list: (params: ContractListParams) =>
    http.get<PageResult<Contract>>('/contracts', params),

  detail: (id: string) =>
    http.get<Contract>(`/contracts/${id}`),

  create: (data: ContractCreateDTO) =>
    http.post<Contract>('/contracts', data),

  update: (id: string, data: Partial<ContractCreateDTO>) =>
    http.patch<Contract>(`/contracts/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`/contracts/${id}`),

  submit: (id: string) =>
    http.post<Contract>(`/contracts/${id}/submit`, {}),

  financeApprove: (id: string, data: ContractApproveDTO) =>
    http.post<Contract>(`/contracts/${id}/finance/approve`, data),

  financeReject: (id: string, data: ContractRejectDTO) =>
    http.post<Contract>(`/contracts/${id}/finance/reject`, data),

  adminSign: (id: string, data: ContractApproveDTO) =>
    http.post<Contract>(`/contracts/${id}/admin/sign`, data),

  adminReject: (id: string, data: ContractRejectDTO) =>
    http.post<Contract>(`/contracts/${id}/admin/reject`, data),

  terminate: (id: string, data: ContractTerminateDTO) =>
    http.post<Contract>(`/contracts/${id}/terminate`, data),

  renew: (id: string, data: ContractRenewDTO) =>
    http.post<Contract>(`/contracts/${id}/renew`, data),
};
