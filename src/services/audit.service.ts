import { http } from '@/api/request';
import type { PageResult, AuditLog, AuditLogListParams } from '@/types';

export const auditService = {
  list: (params: AuditLogListParams) =>
    http.get<PageResult<AuditLog>>('/system/audit-logs', params as Record<string, unknown>),

  resourceHistory: (resourceId: string) =>
    http.get<AuditLog[]>('/system/audit-logs/resource-history', { resourceId }),
};
