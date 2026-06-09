import type { PageParams } from './common';

export interface AuditLogListParams extends PageParams {
  module?: string;
  action?: string;
  userId?: string;
  companyId?: string;
  projectId?: string;
  targetId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditResourceHistoryParams {
  resourceId: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}
