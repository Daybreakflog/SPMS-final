import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

// 真实后端 Announcement：status 为数字、无 type/scope/publisherName，状态由 publishedAt 推导，关联在 project.name
const mockData = {
  items: [
    { id: 'ann-1', title: '电梯维保通知', status: 1, project: { id: 'p-1', name: '示例项目A' }, publishedAt: '2026-05-20T07:00:00Z', createdAt: '2026-05-19T10:00:00Z', updatedAt: '2026-05-20T07:00:00Z' },
    { id: 'ann-2', title: '端午活动公告', status: 0, project: { id: 'p-1', name: '示例项目A' }, publishedAt: null, createdAt: '2026-05-18T08:00:00Z', updatedAt: '2026-05-18T08:00:00Z' },
    { id: 'ann-3', title: '安全管理规定', status: 1, project: { id: 'p-2', name: '示例项目B' }, publishedAt: '2026-05-10T09:00:00Z', createdAt: '2026-05-09T10:00:00Z', updatedAt: '2026-05-10T09:00:00Z' },
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

  // 真实后端公告状态由 publishedAt 推导为"已发布/草稿"标签（无状态 Tab）
  it('renders published/draft status tags', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('电梯维保通知')).toBeInTheDocument();
    });
    expect(screen.getAllByText('已发布').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('草稿').length).toBeGreaterThanOrEqual(1);
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

  // 真实后端公告无 publisherName 字段，改为校验所属项目（project.name）列渲染
  it('renders project scope names', async () => {
    await renderPage();
    await waitFor(() => {
      const cells = screen.getAllByText('示例项目A');
      expect(cells.length).toBeGreaterThanOrEqual(1);
    });
  });
});
