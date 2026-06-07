import type { PageParams } from './common';

export interface AuditLogListParams extends PageParams {
  module?: string;
  action?: string;
  result?: string;
  operatorName?: string;
  startDate?: string;
  endDate?: string;
}
