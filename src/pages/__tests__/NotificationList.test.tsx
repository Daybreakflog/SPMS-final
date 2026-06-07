import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'n-1', title: '工单分配通知', content: '工单 RP-001 已分配给您', type: 'REPAIR', isRead: false, createdAt: '2026-05-28T08:00:00Z' },
    { id: 'n-2', title: '账单生成通知', content: '5月账单已生成', type: 'BILLING', isRead: true, createdAt: '2026-05-27T09:00:00Z' },
    { id: 'n-3', title: '合同到期提醒', content: '合同 CT-001 即将到期', type: 'CONTRACT', isRead: false, createdAt: '2026-05-26T10:00:00Z' },
    { id: 'n-4', title: '系统维护通知', content: '系统将于周日维护', type: 'SYSTEM', isRead: true, createdAt: '2026-05-25T11:00:00Z' },
  ],
  total: 4,
  unreadCount: 2,
};

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    list: vi.fn().mockResolvedValue(mockData),
    markRead: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/store/notification.store', () => ({
  useNotificationStore: () => ({
    unreadCount: 2,
    setUnreadCount: vi.fn(),
    decrement: vi.fn(),
    clearAll: vi.fn(),
  }),
}));

describe('NotificationListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../notice/notifications/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('我的消息')).toBeInTheDocument();
    });
  });

  it('renders notification titles', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('工单分配通知')).toBeInTheDocument();
    });
    expect(screen.getByText('账单生成通知')).toBeInTheDocument();
    expect(screen.getByText('合同到期提醒')).toBeInTheDocument();
  });

  it('renders notification content', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('工单 RP-001 已分配给您')).toBeInTheDocument();
    });
  });

  it('renders type tabs', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  it('renders read all button', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('全部已读')).toBeInTheDocument();
    });
  });

  it('renders unread count badge', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('2 条未读')).toBeInTheDocument();
    });
  });

  it('renders system notification', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('系统维护通知')).toBeInTheDocument();
    });
  });
});
