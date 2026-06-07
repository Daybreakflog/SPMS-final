import { http } from '@/api/request';
import type { PageResult, Complaint, ComplaintListParams, ComplaintAnalysisDTO, ComplaintAppealDTO, ComplaintAppealResolveDTO, ComplaintCloseDTO, ComplaintTimeline } from '@/types';

export const complaintService = {
  list:          (params: ComplaintListParams) => http.get<PageResult<Complaint>>('/complaints', params),
  detail:        (id: string) => http.get<Complaint>(`/complaints/${id}`),
  analyze:       (id: string, data: ComplaintAnalysisDTO) => http.post<void>(`/complaints/${id}/analysis`, data),
  appeal:        (id: string, data: ComplaintAppealDTO) => http.post<void>(`/complaints/${id}/appeals`, data),
  resolveAppeal: (id: string, appealId: string, data: ComplaintAppealResolveDTO) => http.post<void>(`/complaints/${id}/appeals/${appealId}/resolve`, data),
  close:         (id: string, data: ComplaintCloseDTO) => http.post<void>(`/complaints/${id}/close`, data),
  getTimeline:   (id: string) => http.get<ComplaintTimeline[]>(`/complaints/${id}/timeline`),
};
