import { http } from '@/api/request';
import type { PageResult, RepairOrder, RepairListParams, RepairAssignDTO, RepairProgressDTO, RepairCompleteDTO, RepairRatingDTO, RepairMessage, RepairMessageDTO, RepairTimeline } from '@/types';

export const repairService = {
  list:        (params: RepairListParams) => http.get<PageResult<RepairOrder>>('/repairs', params),
  detail:      (id: string) => http.get<RepairOrder>(`/repairs/${id}`),
  assign:      (id: string, data: RepairAssignDTO) => http.post<void>(`/repairs/${id}/assign`, data),
  progress:    (id: string, data: RepairProgressDTO) => http.post<void>(`/repairs/${id}/progress`, data),
  complete:    (id: string, data: RepairCompleteDTO) => http.post<void>(`/repairs/${id}/complete`, data),
  rating:      (id: string, data: RepairRatingDTO) => http.post<void>(`/repairs/${id}/rating`, data),
  getMessages: (id: string) => http.get<RepairMessage[]>(`/repairs/${id}/messages`),
  sendMessage: (id: string, data: RepairMessageDTO) => http.post<void>(`/repairs/${id}/messages`, data),
  getTimeline: (id: string) => http.get<RepairTimeline[]>(`/repairs/${id}/timeline`),
};
