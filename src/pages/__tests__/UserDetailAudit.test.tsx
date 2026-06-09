import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/user.service', () => ({
  userService: { detail: vi.fn() },
}));
vi.mock('@/services/audit.service', () => ({
  auditService: { resourceHistory: vi.fn() },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'user-002' }) };
});
vi.mock('@/constants/roles', () => ({
  RoleLabels: { COMPANY_ADMIN: '公司管理员' },
  RoleColors: { COMPANY_ADMIN: 'blue' },
}));

import { userService } from '@/services/user.service';
import { auditService } from '@/services/audit.service';
import UserDetailPage from '../org/users/detail';

const user = {
  id: 'user-002', username: 'lisi', realName: '李四', phone: '13800138001', email: 'lisi@test.com',
  companyId: 'company-001', companyName: '测试公司', userType: 'STAFF',
  status: 'ACTIVE', roles: ['COMPANY_ADMIN'], projectIds: [],
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
};

const auditLogs = [
  { id: 'al-001', operatorId: 'user-002', operatorName: '李四', module: 'CONTRACT', action: 'APPROVE', targetResource: '合同:CT-001', ipAddress: '10.0.0.1', result: 'SUCCESS', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'al-002', operatorId: 'user-002', operatorName: '李四', module: 'USER', action: 'LOGIN', targetResource: '系统', ipAddress: '10.0.0.2', result: 'SUCCESS', createdAt: '2024-03-01T09:00:00Z' },
];

describe('UserDetailPage 操作日志 Tab 细节', () => {
  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(userService.detail).mockResolvedValue(user as any);
    vi.mocked(auditService.resourceHistory).mockResolvedValue(auditLogs);
  });

  it('调用 auditService.resourceHistory 传递用户 id', async () => {
    renderWithProviders(<UserDetailPage open id="user-002" onClose={() => {}} />);
    await waitFor(() => expect(auditService.resourceHistory).toHaveBeenCalledWith('user-002'));
  });

  it('操作日志 Tab 包含 IP 地址', async () => {
    renderWithProviders(<UserDetailPage open id="user-002" onClose={() => {}} />);
    await waitFor(() => screen.getAllByText('李四')[0]);
    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    if (auditTab) fireEvent.click(auditTab);
    await waitFor(() => expect(screen.getByText(/10\.0\.0\.1/)).toBeInTheDocument());
  });

  it('日志操作类型 LOGIN 显示', async () => {
    renderWithProviders(<UserDetailPage open id="user-002" onClose={() => {}} />);
    await waitFor(() => screen.getAllByText('李四')[0]);
    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    if (auditTab) fireEvent.click(auditTab);
    await waitFor(() => {
      const items = screen.getAllByText('LOGIN');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('日志操作类型 APPROVE 显示', async () => {
    renderWithProviders(<UserDetailPage open id="user-002" onClose={() => {}} />);
    await waitFor(() => screen.getAllByText('李四')[0]);
    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    if (auditTab) fireEvent.click(auditTab);
    await waitFor(() => expect(screen.getByText('APPROVE')).toBeInTheDocument());
  });
});
