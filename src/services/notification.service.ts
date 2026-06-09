import { http } from '@/api/request';
import type { PageResult, Notification, NotificationListParams } from '@/types';

// 后端 /notifications/* 仅支持：列表、单条已读、批量已读、全部已读
// 删除、stats、偏好设置等接口后端不存在，已移除
export const notificationService = {
  list:      (params: NotificationListParams) => http.get<PageResult<Notification>>('/notifications', params),
  read:      (id: string) => http.patch<void>(`/notifications/${id}/read`),
  batchRead: (ids: string[]) => http.patch<void>('/notifications/read', { ids }),
  readAll:   () => http.patch<void>('/notifications/read-all'),
};
