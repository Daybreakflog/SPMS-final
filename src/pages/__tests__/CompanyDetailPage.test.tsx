import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/company.service', () => ({
  companyService: {
    detail: vi.fn(),
  },
}));
vi.mock('@/services/project.service', () => ({
  projectService: {
    list: vi.fn(),
  },
}));
vi.mock('@/services/user.service', () => ({
  userService: {
    list: vi.fn(),
  },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'company-001' }) };
});

import { companyService } from '@/services/company.service';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import CompanyDetailPage from '../platform/companies/detail';

const mockCompany = {
  id: 'company-001', name: '测试物业公司', code: 'TEST001', contact: '张三', phone: '13800138000',
  email: 'test@example.com', address: '测试地址', status: 'ACTIVE', projectCount: 2, staffCount: 5,
  createdAt: '2024-01-01T00:00:00Z', remark: '',
};
const mockProjects = {
  items: [{ id: 'p-001', name: '测试项目A', companyId: 'company-001', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', companyName: '测试物业', address: '', buildingCount: 2, unitCount: 20 }],
  total: 1, page: 1, pageSize: 50, totalPages: 1,
};
const mockUsers = {
  items: [{ id: 'u-001', username: 'admin', realName: '管理员', phone: '13800138001', roles: ['PLATFORM_ADMIN'], status: 'ACTIVE', companyId: 'company-001', companyName: '测试物业', projectIds: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
  total: 1, page: 1, pageSize: 10, totalPages: 1,
};

describe('CompanyDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyService.detail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCompany);
    (projectService.list as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjects);
    (userService.list as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsers);
  });

  it('加载完成后显示公司名称', async () => {
    renderWithProviders(<CompanyDetailPage />, { route: '/platform/companies/company-001' });
    await waitFor(() => expect(screen.getAllByText('测试物业公司')[0]).toBeInTheDocument());
  });

  it('项目列表 Tab 渲染项目数据', async () => {
    renderWithProviders(<CompanyDetailPage />, { route: '/platform/companies/company-001' });
    await waitFor(() => screen.getAllByText('测试物业公司')[0]);
    const tabs = screen.getAllByRole('tab');
    const projectTab = tabs.find((el) => el.textContent?.includes('项目'));
    if (projectTab) fireEvent.click(projectTab);
    await waitFor(() => expect(screen.getByText('测试项目A')).toBeInTheDocument());
  });

  it('员工列表 Tab 渲染用户数据', async () => {
    renderWithProviders(<CompanyDetailPage />, { route: '/platform/companies/company-001' });
    await waitFor(() => screen.getAllByText('测试物业公司')[0]);
    const tabs = screen.getAllByRole('tab');
    const staffTab = tabs.find((el) => el.textContent?.includes('员工'));
    if (staffTab) fireEvent.click(staffTab);
    await waitFor(() => expect(screen.getByText('管理员')).toBeInTheDocument());
  });

  it('公司不存在时显示提示', async () => {
    (companyService.detail as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    renderWithProviders(<CompanyDetailPage />, { route: '/platform/companies/company-001' });
    await waitFor(() => expect(screen.getByText('公司不存在')).toBeInTheDocument());
  });
});
