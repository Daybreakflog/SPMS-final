import { http } from '@/api/request';
import type { PageResult, Notification, NotificationListParams } from '@/types';

export const notificationService = {
  list:      (params: NotificationListParams) => http.get<PageResult<Notification>>('/notifications', params),
  read:      (id: string) => http.patch<void>(`/notifications/${id}/read`),
  batchRead: (ids: string[]) => http.patch<void>('/notifications/read', { ids }),
  readAll:   () => http.patch<void>('/notifications/read-all'),
};
