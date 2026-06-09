import { describe, it, expect } from 'vitest';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABEL_KEYS,
  NOTIFICATION_TYPE_COLORS,
  formatNotificationType,
  filterUnread,
  countUnread,
} from '@/utils/notification';
import type { NotificationItem } from '@/types/api/notification';

function makeItem(id: string, isRead: boolean): NotificationItem {
  return { id, type: 'SYSTEM', title: `t-${id}`, content: 'c', isRead, createdAt: '2026-06-07T00:00:00Z' };
}

describe('notification utils', () => {
  it('exposes all four notification types', () => {
    expect(NOTIFICATION_TYPES).toEqual(['CONTRACT_EXPIRY', 'BILL_OVERDUE', 'REPAIR_ASSIGNED', 'SYSTEM']);
    expect(NOTIFICATION_TYPES).toHaveLength(4);
  });

  it('maps every type to a label key', () => {
    NOTIFICATION_TYPES.forEach((t) => {
      expect(NOTIFICATION_TYPE_LABEL_KEYS[t]).toMatch(/^notification\./);
    });
  });

  it('maps every type to a color', () => {
    expect(NOTIFICATION_TYPE_COLORS.CONTRACT_EXPIRY).toBe('blue');
    expect(NOTIFICATION_TYPE_COLORS.BILL_OVERDUE).toBe('red');
    expect(NOTIFICATION_TYPE_COLORS.REPAIR_ASSIGNED).toBe('orange');
    expect(NOTIFICATION_TYPE_COLORS.SYSTEM).toBe('default');
  });

  it('formatNotificationType returns the correct label key', () => {
    expect(formatNotificationType('CONTRACT_EXPIRY')).toBe('notification.contractExpiry');
    expect(formatNotificationType('SYSTEM')).toBe('notification.system');
  });

  it('filterUnread keeps only unread items', () => {
    const items = [makeItem('1', false), makeItem('2', true), makeItem('3', false)];
    const unread = filterUnread(items);
    expect(unread).toHaveLength(2);
    expect(unread.map((i) => i.id)).toEqual(['1', '3']);
  });

  it('filterUnread returns empty array when all read', () => {
    const items = [makeItem('1', true), makeItem('2', true)];
    expect(filterUnread(items)).toEqual([]);
  });

  it('filterUnread handles empty input', () => {
    expect(filterUnread([])).toEqual([]);
  });

  it('countUnread counts unread items', () => {
    const items = [makeItem('1', false), makeItem('2', true), makeItem('3', false)];
    expect(countUnread(items)).toBe(2);
  });

  it('countUnread returns 0 when none unread', () => {
    expect(countUnread([makeItem('1', true)])).toBe(0);
  });

  it('countUnread returns 0 for empty list', () => {
    expect(countUnread([])).toBe(0);
  });

  it('label keys cover all colors consistently', () => {
    expect(Object.keys(NOTIFICATION_TYPE_LABEL_KEYS).sort()).toEqual(Object.keys(NOTIFICATION_TYPE_COLORS).sort());
  });

  it('does not mutate the input array', () => {
    const items = [makeItem('1', false), makeItem('2', true)];
    filterUnread(items);
    expect(items).toHaveLength(2);
  });
});
