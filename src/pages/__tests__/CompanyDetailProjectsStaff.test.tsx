import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/company.service', () => ({
  companyService: { detail: vi.fn() },
}));
vi.mock('@/services/project.service', () => ({
  projectService: { list: vi.fn() },
}));
vi.mock('@/services/user.service', () => ({
  userService: { list: vi.fn() },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'company-002' }) };
});

import { companyService } from '@/services/company.service';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import CompanyDetailPage from '../platform/companies/detail';

const mockCompany = {
  id: 'company-002', name: '鑫海物业', code: 'XH002', contact: '王建华', phone: '13900139000',
  email: 'xh@example.com', address: '北京市朝阳区', status: 'ACTIVE', projectCount: 3, staffCount: 8,
  createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z', remark: '',
};

describe('CompanyDetailPage - 数据加载', () => {
  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(companyService.detail).mockResolvedValue(mockCompany as any);
    vi.mocked(projectService.list).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 0 });
    vi.mocked(userService.list).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
  });

  it('调用 companyService.detail', async () => {
    renderWithProviders(<CompanyDetailPage open id="company-002" onClose={() => {}} />);
    await waitFor(() => expect(companyService.detail).toHaveBeenCalledWith('company-002'));
  });

  it('调用 projectService.list with companyId', async () => {
    renderWithProviders(<CompanyDetailPage open id="company-002" onClose={() => {}} />);
    await waitFor(() => expect(projectService.list).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'company-002' })
    ));
  });

  it('调用 userService.list with companyId', async () => {
    renderWithProviders(<CompanyDetailPage open id="company-002" onClose={() => {}} />);
    await waitFor(() => expect(userService.list).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'company-002' })
    ));
  });

  it('显示公司地址', async () => {
    renderWithProviders(<CompanyDetailPage open id="company-002" onClose={() => {}} />);
    await waitFor(() => expect(screen.getAllByText('北京市朝阳区')[0]).toBeInTheDocument());
  });

  it('基础信息 Tab 默认激活', async () => {
    renderWithProviders(<CompanyDetailPage open id="company-002" onClose={() => {}} />);
    await waitFor(() => screen.getAllByText('鑫海物业')[0]);
    const tabs = screen.getAllByRole('tab');
    const infoTab = tabs.find((el) => el.textContent?.includes('基础'));
    expect(infoTab).toBeTruthy();
  });
});
