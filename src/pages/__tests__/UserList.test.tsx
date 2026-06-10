import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockUsers = {
  items: [
    {
      id: 'user-001',
      username: 'zhangwei',
      realName: '张伟',
      phone: '13800138000',
      email: 'zhangwei@example.com',
      roles: [{ roleId: 'r-cs', role: { id: 'r-cs', name: 'CUSTOMER_SERVICE', label: '客服人员' } }],
      projects: [{ projectId: 'proj-001', project: { id: 'proj-001', name: '翡翠湾一期' } }],
      companyId: 'comp-001',
      company: { id: 'comp-001', name: '翡翠湾物业' },
      userType: 'STAFF',
      status: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-002',
      username: 'lifang',
      realName: '李芳',
      phone: '13900139000',
      email: 'lifang@example.com',
      roles: [{ roleId: 'r-eng', role: { id: 'r-eng', name: 'ENGINEER', label: '工程人员' } }],
      projects: [
        { projectId: 'proj-001', project: { id: 'proj-001', name: '翡翠湾一期' } },
        { projectId: 'proj-002', project: { id: 'proj-002', name: '翡翠湾二期' } },
      ],
      companyId: 'comp-001',
      company: { id: 'comp-001', name: '翡翠湾物业' },
      userType: 'STAFF',
      status: 1,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

// 仅 mock service 方法，保留真实 normalizeRoles / normalizeUser（页面会用到）
vi.mock('@/services/user.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/user.service')>('@/services/user.service');
  return {
    ...actual,
    userService: {
      list: vi.fn().mockResolvedValue(mockUsers),
      remove: vi.fn().mockResolvedValue({}),
      changePassword: vi.fn().mockResolvedValue({}),
    },
  };
});

vi.mock('@/services/project.service', () => ({
  projectService: {
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

describe('UserListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../org/users/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('员工管理')).toBeInTheDocument();
    });
  });

  it('renders user names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeInTheDocument();
      expect(screen.getByText('李芳')).toBeInTheDocument();
    });
  });

  it('renders usernames', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('zhangwei')).toBeInTheDocument();
      expect(screen.getByText('lifang')).toBeInTheDocument();
    });
  });

  it('renders phone numbers', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('13800138000')).toBeInTheDocument();
    });
  });

  it('renders search inputs', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeInTheDocument();
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders detail buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const btns = screen.getAllByText('详情');
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays table structure', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.querySelector('.ant-table')).toBeInTheDocument();
    });
  });
});
