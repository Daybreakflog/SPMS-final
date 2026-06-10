import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { useUserStore } from '@/store/user.store';
import { RoleCode, UserType } from '@/types/enums';

const mockOverview = {
  occupancyRate: 92,
  occupancyRateTrend: 1.2,
  monthlyReceivable: 150000,
  monthlyReceivableTrend: 3.5,
  monthlyCollected: 130000,
  monthlyCollectedTrend: -1.8,
  collectionRate: 87,
  collectionRateTrend: 2.1,
  pendingRepairs: 5,
  pendingRepairsTrend: -16.7,
  overdueBillsCount: 12,
  overdueBillsTrend: 8.3,
};

const mockTrend = [
  { month: '2026-01', receivable: 100000, collected: 90000 },
  { month: '2026-02', receivable: 120000, collected: 110000 },
];

const mockRepairDist = [
  { label: '待处理', count: 5 },
  { label: '处理中', count: 3 },
  { label: '已完成', count: 10 },
];

const mockTodos = [
  { id: '1', title: '待审批合同', description: '合同 CT-001 待审批', targetUrl: '/contracts/1', deadline: '2026-06-01' },
];

const mockNotice = [
  { id: '1', title: '系统维护通知', publishedAt: '2026-05-28T10:00:00Z' },
];

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    overview: vi.fn().mockResolvedValue(mockOverview),
    trend: vi.fn().mockResolvedValue(mockTrend),
    repairDist: vi.fn().mockResolvedValue(mockRepairDist),
    todoList: vi.fn().mockResolvedValue(mockTodos),
    latestNotice: vi.fn().mockResolvedValue(mockNotice),
  },
}));

vi.mock('echarts-for-react/lib/core', () => ({
  default: () => <div data-testid="echarts-mock">chart</div>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({
      user: {
        id: 'test-admin',
        username: 'admin',
        realName: 'Admin',
        roles: [RoleCode.PLATFORM_ADMIN],
        companyId: 'c1',
        companyName: 'Test Co',
        projectIds: [],
        userType: UserType.STAFF,
      },
    });
  });

  async function renderDashboard() {
    const mod = await import('../dashboard/index');
    const DashboardPage = mod.default;
    return renderWithProviders(<DashboardPage />);
  }

  it('renders KPI cards with correct data', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    // Check that KPI values render (might be within nested spans)
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('运营概览')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    await renderDashboard();
    await waitFor(() => {
      const charts = screen.getAllByTestId('echarts-mock');
      expect(charts.length).toBe(2);
    });
  });

  // 待办/最新公告子模块后端无对应接口，已降级为空（详见 dashboard/index.tsx 注释）。
  it('renders todo card with empty state (degraded module)', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('待办事项')).toBeInTheDocument();
    });
    expect(screen.getByText('暂无待办')).toBeInTheDocument();
    expect(screen.queryByText('待审批合同')).not.toBeInTheDocument();
  });

  it('renders latest announcements card (degraded module)', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('最新公告')).toBeInTheDocument();
    });
    expect(screen.queryByText('系统维护通知')).not.toBeInTheDocument();
  });

  it('has project filter selector', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('运营概览')).toBeInTheDocument();
    });
    const selectors = screen.getAllByRole('combobox');
    expect(selectors.length).toBeGreaterThanOrEqual(1);
  });

  it('renders view all buttons', async () => {
    await renderDashboard();
    await waitFor(() => {
      const viewAllButtons = screen.getAllByText('查看全部');
      expect(viewAllButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
