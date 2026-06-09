import { http } from '@/api/request';
import type { PageResult, AuditLog, AuditLogListParams } from '@/types';

export const auditService = {
  list: (params: AuditLogListParams) =>
    http.get<PageResult<AuditLog>>('/system/audit-logs', params as Record<string, unknown>),

  // ⚠ GET /system/audit-logs/resource-history 后端不存在，始终返回空数组。
  // TODO(backend): 后端补齐后改为 http.get('/system/audit-logs/resource-history', { resourceId })
  resourceHistory: (resourceId: string): Promise<AuditLog[]> => {
    void resourceId;
    return Promise.resolve([]);
  },
};
