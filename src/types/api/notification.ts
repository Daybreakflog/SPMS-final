import type { PageParams } from './common';

export interface NotificationListParams extends PageParams {
  type?: string;
  read?: boolean;
}

export interface NotificationBatchReadDTO {
  ids: string[];
}
