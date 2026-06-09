import { http } from '@/api/request';
import type { PageResult, Complaint, ComplaintListParams, ComplaintCreateDTO, ComplaintAnalysisDTO, ComplaintAppealDTO, ComplaintAppealResolveDTO, ComplaintCloseDTO } from '@/types';

export const complaintService = {
  list:          (params: ComplaintListParams) => http.get<PageResult<Complaint>>('/complaints', params),
  detail:        (id: string) => http.get<Complaint>(`/complaints/${id}`),
  create:        (data: ComplaintCreateDTO) => http.post<Complaint>('/complaints', data),
  analyze:       (id: string, data: ComplaintAnalysisDTO) => http.post<void>(`/complaints/${id}/analysis`, data),
  appeal:        (id: string, data: ComplaintAppealDTO) => http.post<void>(`/complaints/${id}/appeals`, data),
  resolveAppeal: (id: string, appealId: string, data: ComplaintAppealResolveDTO) => http.post<void>(`/complaints/${id}/appeals/${appealId}/resolve`, data),
  close:         (id: string, data: ComplaintCloseDTO) => http.post<void>(`/complaints/${id}/close`, data),
};
