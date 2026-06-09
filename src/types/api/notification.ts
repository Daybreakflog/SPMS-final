import type { PageParams } from './common';

export interface NotificationListParams extends PageParams {
  type?: string;
  read?: boolean;
}

export interface NotificationBatchReadDTO {
  ids: string[];
}

// ===== Sprint 17: 实时通知中心 =====
export type NotificationCenterType =
  | 'CONTRACT_EXPIRY'
  | 'BILL_OVERDUE'
  | 'REPAIR_ASSIGNED'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  type: NotificationCenterType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  linkPath?: string;
}

export interface NotificationQuery {
  page: number;
  pageSize: number;
  isRead?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

/** 通知偏好：按类型开关接收 */
export interface NotificationPreference {
  type: NotificationCenterType;
  enabled: boolean;
}
