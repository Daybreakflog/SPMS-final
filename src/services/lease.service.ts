import { http } from '@/api/request';
import type { PageResult, Lease, LeaseListParams, CheckInDTO, CheckOutDTO } from '@/types';

export const leaseService = {
  list: (params: LeaseListParams) =>
    http.get<PageResult<Lease>>('/leases', params),

  detail: (id: string) =>
    http.get<Lease>(`/leases/${id}`),

  checkIn: (data: CheckInDTO) =>
    http.post<Lease>('/leases/check-in', data),

  checkOut: (id: string, data: CheckOutDTO) =>
    http.post<Lease>(`/leases/${id}/check-out`, data),
};
