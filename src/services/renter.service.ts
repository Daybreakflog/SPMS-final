import { http } from '@/api/request';
import type { PageResult, Renter, RenterAccount, RenterListParams, RenterCreateDTO, RenterUpdateDTO, RenterAccountCreateDTO, RenterAccountUpdateDTO, RenterResetPasswordDTO } from '@/types';

export const renterService = {
  list: (params: RenterListParams) =>
    http.get<PageResult<Renter>>('/renters', params),

  detail: (id: string) =>
    http.get<Renter>(`/renters/${id}`),

  create: (data: RenterCreateDTO) =>
    http.post<Renter>('/renters', data),

  update: (id: string, data: RenterUpdateDTO) =>
    http.put<Renter>(`/renters/${id}`, data),

  remove: (id: string) =>
    http.delete<void>(`/renters/${id}`),

  getAccounts: (id: string) =>
    http.get<RenterAccount[]>(`/renters/${id}/accounts`),

  createAccount: (id: string, data: RenterAccountCreateDTO) =>
    http.post<RenterAccount>(`/renters/${id}/accounts`, data),

  updateAccount: (accountId: string, data: RenterAccountUpdateDTO) =>
    http.patch<RenterAccount>(`/renters/accounts/${accountId}`, data),

  resetPassword: (accountId: string, data: RenterResetPasswordDTO) =>
    http.post<void>(`/renters/accounts/${accountId}/reset-password`, data),
};
