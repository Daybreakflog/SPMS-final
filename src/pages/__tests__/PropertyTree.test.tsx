import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockProjects = {
  items: [{ id: 'p-1', name: '翡翠湾' }],
  total: 1,
};

const mockTree = [
  {
    key: 'b-1',
    title: '1号楼',
    type: 'BUILDING',
    id: 'b-1',
    data: { id: 'b-1', name: '1号楼', code: 'B01', totalFloors: 6, totalUnits: 24, builtYear: 2020 },
    children: [],
  },
];

vi.mock('@/services/project.service', () => ({
  projectService: {
    list: vi.fn().mockResolvedValue(mockProjects),
  },
}));

vi.mock('@/services/property.service', () => ({
  propertyService: {
    getTree: vi.fn().mockResolvedValue(mockTree),
  },
}));

vi.mock('@/services/renter.service', () => ({
  renterService: {
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PropertyTreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../properties/tree/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('房源树')).toBeInTheDocument();
    });
  });

  it('renders selected project name', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾')).toBeInTheDocument();
    });
  });

  it('renders tree building node', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('1号楼')).toBeInTheDocument();
    });
  });

  it('renders empty detail hint when nothing selected', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('请选择节点查看详情')).toBeInTheDocument();
    });
  });

  it('renders add building button', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('新增楼栋')).toBeInTheDocument();
    });
  });

  it('loads tree via service', async () => {
    const { propertyService } = await import('@/services/property.service');
    await renderPage();
    await waitFor(() => {
      expect(propertyService.getTree).toHaveBeenCalledWith('p-1');
    });
  });

  it('loads project list via service', async () => {
    const { projectService } = await import('@/services/project.service');
    await renderPage();
    await waitFor(() => {
      expect(projectService.list).toHaveBeenCalled();
    });
  });
});
