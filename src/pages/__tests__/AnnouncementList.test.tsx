import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'ann-1', title: '电梯维保通知', type: 'NOTICE', scope: 'ALL', status: 'PUBLISHED', publisherName: '管理员', publishedAt: '2026-05-20T07:00:00Z', createdAt: '2026-05-19T10:00:00Z' },
    { id: 'ann-2', title: '端午活动公告', type: 'ACTIVITY', scope: 'ALL', status: 'DRAFT', publisherName: '运营', publishedAt: null, createdAt: '2026-05-18T08:00:00Z' },
    { id: 'ann-3', title: '安全管理规定', type: 'POLICY', scope: 'PROJECT', status: 'ARCHIVED', publisherName: '管理员', publishedAt: '2026-05-10T09:00:00Z', createdAt: '2026-05-09T10:00:00Z' },
  ],
  total: 3,
};

vi.mock('@/services/announcement.service', () => ({
  announcementService: {
    list: vi.fn().mockResolvedValue(mockData),
    publish: vi.fn().mockResolvedValue(undefined),
    archive: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AnnouncementListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../notice/announcements/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('公告管理')).toBeInTheDocument();
    });
  });

  it('renders announcement list data', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('电梯维保通知')).toBeInTheDocument();
    });
    expect(screen.getByText('端午活动公告')).toBeInTheDocument();
    expect(screen.getByText('安全管理规定')).toBeInTheDocument();
  });

  it('renders status tabs', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('公告管理')).toBeInTheDocument();
    });
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders announcement types', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('电梯维保通知')).toBeInTheDocument();
    });
    expect(screen.getByText('端午活动公告')).toBeInTheDocument();
  });

  it('renders search filter bar', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('公告管理')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('标题/关键词')).toBeInTheDocument();
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 3 条')).toBeInTheDocument();
    });
  });

  it('renders publisher names', async () => {
    await renderPage();
    await waitFor(() => {
      const adminCells = screen.getAllByText('管理员');
      expect(adminCells.length).toBeGreaterThanOrEqual(1);
    });
  });
});
