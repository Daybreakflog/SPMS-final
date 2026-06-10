import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/user.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/user.service')>('@/services/user.service');
  return { ...actual, userService: { detail: vi.fn() } };
});

vi.mock('@/services/audit.service', () => ({
  auditService: { resourceHistory: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'user-001' }) };
});

vi.mock('@/constants/roles', () => ({
  RoleLabels: { PLATFORM_ADMIN: '平台管理员', COMPANY_ADMIN: '公司管理员' },
  RoleColors: { PLATFORM_ADMIN: 'red', COMPANY_ADMIN: 'blue' },
}));

import { userService } from '@/services/user.service';
import { auditService } from '@/services/audit.service';
import UserDetailPage from '../org/users/detail';

// 真实后端 /users/:id 形态：嵌套 roles/projects、无扁平 companyName、status 为数字
const mockUser = {
  id: 'user-001', username: 'admin', realName: '张三', phone: '13800138000', email: 'admin@test.com',
  companyId: 'company-001', company: { id: 'company-001', name: '测试公司' }, userType: 'STAFF',
  status: 1,
  roles: [{ roleId: 'r-pa', role: { id: 'r-pa', name: 'PLATFORM_ADMIN', label: '平台管理员' } }],
  projects: [{ projectId: 'p-001', project: { id: 'p-001', name: '示例项目' } }],
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
};

const mockLogs = [
  {
    id: 'audit-001', operatorId: 'user-001', operatorName: '张三', module: 'USER',
    action: 'UPDATE', targetResource: '用户:user-001', ipAddress: '192.168.1.100',
    result: 'SUCCESS', createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'audit-002', operatorId: 'user-001', operatorName: '张三', module: 'SYSTEM',
    action: 'LOGIN', targetResource: '系统:login', ipAddress: '192.168.1.101',
    result: 'SUCCESS', createdAt: '2024-01-01T09:00:00Z',
  },
];

describe('UserDetailPage - 操作日志 Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(userService.detail).mockResolvedValue(mockUser as any);
    vi.mocked(auditService.resourceHistory).mockResolvedValue(mockLogs);
  });

  it('显示用户姓名', async () => {
    renderWithProviders(<UserDetailPage open id="user-001" onClose={() => {}} />, { route: '/org/users/user-001' });
    await waitFor(() => expect(screen.getAllByText('张三')[0]).toBeInTheDocument());
  });

  it('操作日志 Tab 标签可见', async () => {
    renderWithProviders(<UserDetailPage open id="user-001" onClose={() => {}} />, { route: '/org/users/user-001' });
    await waitFor(() => screen.getAllByText('张三')[0]);
    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    expect(auditTab).toBeTruthy();
  });

  it('点击操作日志 Tab 后展示日志条目', async () => {
    renderWithProviders(<UserDetailPage open id="user-001" onClose={() => {}} />, { route: '/org/users/user-001' });
    await waitFor(() => screen.getAllByText('张三')[0]);

    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    if (auditTab) fireEvent.click(auditTab);

    await waitFor(() => expect(screen.getByText('UPDATE')).toBeInTheDocument());
  });

  it('无日志时显示空状态', async () => {
    vi.mocked(auditService.resourceHistory).mockResolvedValue([]);
    renderWithProviders(<UserDetailPage open id="user-001" onClose={() => {}} />, { route: '/org/users/user-001' });
    await waitFor(() => screen.getAllByText('张三')[0]);

    const tabs = screen.getAllByRole('tab');
    const auditTab = tabs.find((el) => el.textContent?.includes('操作日志'));
    if (auditTab) fireEvent.click(auditTab);

    await waitFor(() => expect(screen.getByText('暂无操作日志')).toBeInTheDocument());
  });
});
