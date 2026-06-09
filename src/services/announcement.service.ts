import { http } from '@/api/request';
import type { PageResult, Announcement, AnnouncementListParams, AnnouncementCreateDTO, AnnouncementUpdateDTO } from '@/types';

export const announcementService = {
  list:    (params: AnnouncementListParams) => http.get<PageResult<Announcement>>('/announcements', params),
  detail:  (id: string) => http.get<Announcement>(`/announcements/${id}`),
  create:  (data: AnnouncementCreateDTO) => http.post<Announcement>('/announcements', data),
  update:  (id: string, data: AnnouncementUpdateDTO) => http.patch<Announcement>(`/announcements/${id}`, data),
  remove:  (id: string) => http.delete<void>(`/announcements/${id}`),
  publish: (id: string) => http.patch<Announcement>(`/announcements/${id}`, { publish: true }),
  archive: (id: string) => http.patch<Announcement>(`/announcements/${id}`, { status: 0 }),
};
