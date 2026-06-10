import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { useUserStore } from '@/store/user.store';
import { RoleCode, UserType } from '@/types/enums';

const mockCompanies = {
  items: [
    {
      id: 'comp-001',
      name: '翡翠湾物业',
      code: 'PM0001',
      contact: '张经理',
      phone: '13800138000',
      email: 'zhang@example.com',
      address: '北京市朝阳区',
      projectCount: 3,
      staffCount: 25,
      remark: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comp-002',
      name: '阳光城物业',
      code: 'PM0002',
      contact: '李经理',
      phone: '13900139000',
      email: 'li@example.com',
      address: '上海市浦东新区',
      projectCount: 5,
      staffCount: 40,
      remark: '',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

vi.mock('@/services/company.service', () => ({
  companyService: {
    list: vi.fn().mockResolvedValue(mockCompanies),
    remove: vi.fn().mockResolvedValue({}),
  },
}));

describe('CompanyListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 注入平台管理员登录态，使 PermissionGuard 放行编辑/新建按钮
    useUserStore.setState({
      user: {
        id: 'u-admin', username: 'admin', realName: '管理员', roles: [RoleCode.PLATFORM_ADMIN],
        companyId: 'comp-001', companyName: '翡翠湾物业', projectIds: [], userType: UserType.STAFF,
      },
    });
  });

  async function renderPage() {
    const mod = await import('../platform/companies/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('物业公司管理')).toBeInTheDocument();
    });
  });

  it('renders company data', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾物业')).toBeInTheDocument();
      expect(screen.getByText('阳光城物业')).toBeInTheDocument();
    });
  });

  it('renders contact persons', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张经理')).toBeInTheDocument();
      expect(screen.getByText('李经理')).toBeInTheDocument();
    });
  });

  it('renders search area', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾物业')).toBeInTheDocument();
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders action buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const editBtns = screen.getAllByText('编辑');
      expect(editBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders project count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('displays search input', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾物业')).toBeInTheDocument();
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });
});
