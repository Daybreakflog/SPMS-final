import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'a-1', operatorId: 'u-1', operatorName: '张管理', module: 'USER', action: 'UPDATE', targetResource: '用户:user-101', ipAddress: '192.168.1.100', result: 'SUCCESS', detail: '{"old":{"phone":"13800000001"},"new":{"phone":"13800000002"}}', createdAt: '2026-05-01T10:00:00Z' },
    { id: 'a-2', operatorId: 'u-2', operatorName: '李财务', module: 'BILLING', action: 'CREATE', targetResource: '账单:BILL-001', ipAddress: '192.168.1.101', result: 'FAILURE', detail: undefined, createdAt: '2026-05-02T11:00:00Z' },
  ],
  total: 2,
};

vi.mock('@/services/audit.service', () => ({
  auditService: {
    list: vi.fn().mockResolvedValue(mockData),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AuditLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../system/audit-logs/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('审计日志').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders operator names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('张管理').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('李财务').length).toBeGreaterThanOrEqual(1);
  });

  it('renders target resources', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('用户:user-101').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders result tags', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('成功').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('失败').length).toBeGreaterThanOrEqual(1);
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 2 条')).toBeInTheDocument();
    });
  });

  it('renders view detail buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const btns = screen.getAllByText('查看详情');
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders ip addresses', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });
  });
});
