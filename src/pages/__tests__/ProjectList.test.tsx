import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockProjects = {
  items: [
    {
      id: 'proj-001',
      name: '翡翠湾花园',
      companyId: 'comp-001',
      companyName: '翡翠湾物业',
      address: '北京市朝阳区翡翠湾路1号',
      manager: '王经理',
      contactPhone: '13800138000',
      buildingCount: 5,
      unitCount: 200,
      occupancyRate: 92.5,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'proj-002',
      name: '阳光城',
      companyId: 'comp-002',
      companyName: '阳光城物业',
      address: '上海市浦东新区阳光城路2号',
      manager: '李经理',
      contactPhone: '13900139000',
      buildingCount: 8,
      unitCount: 350,
      occupancyRate: 88.0,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

vi.mock('@/services/project.service', () => ({
  projectService: {
    list: vi.fn().mockResolvedValue(mockProjects),
    remove: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/company.service', () => ({
  companyService: {
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

describe('ProjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../org/projects/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('项目管理')).toBeInTheDocument();
    });
  });

  it('renders project names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾花园')).toBeInTheDocument();
      expect(screen.getByText('阳光城')).toBeInTheDocument();
    });
  });

  it('renders manager names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('王经理')).toBeInTheDocument();
      expect(screen.getByText('李经理')).toBeInTheDocument();
    });
  });

  it('renders search area', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾花园')).toBeInTheDocument();
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders building count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('renders occupancy rate', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('92.5%')).toBeInTheDocument();
    });
  });

  it('renders detail buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const detailBtns = screen.getAllByText('详情');
      expect(detailBtns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
