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
      department: '客服部',
      roles: ['CUSTOMER_SERVICE'],
      projectIds: ['proj-001'],
      companyId: 'comp-001',
      companyName: '翡翠湾物业',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-002',
      username: 'lifang',
      realName: '李芳',
      phone: '13900139000',
      email: 'lifang@example.com',
      department: '工程部',
      roles: ['ENGINEER'],
      projectIds: ['proj-001', 'proj-002'],
      companyId: 'comp-001',
      companyName: '翡翠湾物业',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

vi.mock('@/services/user.service', () => ({
  userService: {
    list: vi.fn().mockResolvedValue(mockUsers),
    remove: vi.fn().mockResolvedValue({}),
    changePassword: vi.fn().mockResolvedValue({}),
  },
}));

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
