import type { NotificationCenterType, NotificationItem } from '@/types/api/notification';

export const NOTIFICATION_TYPES: NotificationCenterType[] = [
  'CONTRACT_EXPIRY',
  'BILL_OVERDUE',
  'REPAIR_ASSIGNED',
  'SYSTEM',
];

export const NOTIFICATION_TYPE_LABEL_KEYS: Record<NotificationCenterType, string> = {
  CONTRACT_EXPIRY: 'notification.contractExpiry',
  BILL_OVERDUE: 'notification.billOverdue',
  REPAIR_ASSIGNED: 'notification.repairAssigned',
  SYSTEM: 'notification.system',
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationCenterType, string> = {
  CONTRACT_EXPIRY: 'blue',
  BILL_OVERDUE: 'red',
  REPAIR_ASSIGNED: 'orange',
  SYSTEM: 'default',
};

/** 返回通知类型对应的 i18n labelKey；未知类型回退到 SYSTEM。 */
export function formatNotificationType(type: NotificationCenterType): string {
  return NOTIFICATION_TYPE_LABEL_KEYS[type] ?? NOTIFICATION_TYPE_LABEL_KEYS.SYSTEM;
}

/** 过滤出未读通知。 */
export function filterUnread(items: NotificationItem[]): NotificationItem[] {
  return items.filter((n) => !n.isRead);
}

/** 统计未读数量。 */
export function countUnread(items: NotificationItem[]): number {
  return filterUnread(items).length;
}
