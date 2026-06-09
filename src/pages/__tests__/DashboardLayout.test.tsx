import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { useUserStore } from '@/store/user.store';
import { RoleCode, UserType } from '@/types/enums';

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    overview: vi.fn().mockResolvedValue({
      occupancyRate: 92, occupancyRateTrend: 1.2,
      monthlyReceivable: 150000, monthlyReceivableTrend: 3.5,
      monthlyCollected: 130000, monthlyCollectedTrend: -1.8,
      collectionRate: 87, collectionRateTrend: 2.1,
      pendingRepairs: 5, pendingRepairsTrend: -16.7,
      overdueBillsCount: 12, overdueBillsTrend: 8.3,
    }),
    trend: vi.fn().mockResolvedValue([]),
    repairDist: vi.fn().mockResolvedValue([]),
    todoList: vi.fn().mockResolvedValue([]),
    latestNotice: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('echarts-for-react/lib/core', () => ({
  default: () => <div data-testid="echarts-mock">chart</div>,
}));

describe('Dashboard Layout Customization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
    return renderWithProviders(<mod.default />);
  }

  it('renders settings button', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    const settingsIcon = document.querySelector('[data-icon="setting"]');
    expect(settingsIcon).toBeTruthy();
  });

  it('has compact/standard density toggle', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(btn => btn.querySelector('[data-icon="setting"]'));
    if (settingsBtn) {
      fireEvent.click(settingsBtn);
      await waitFor(() => {
        expect(screen.getByText('紧凑')).toBeInTheDocument();
        expect(screen.getByText('标准')).toBeInTheDocument();
      });
    }
  });

  it('has module visibility toggles', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find(btn => btn.querySelector('[data-icon="setting"]'));
    if (settingsBtn) {
      fireEvent.click(settingsBtn);
      await waitFor(() => {
        expect(screen.getByText('KPI')).toBeInTheDocument();
      });
    }
  });

  it('loads default layout preferences', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    // Default prefs: standard density, all modules visible
    expect(screen.getByText('收缴趋势')).toBeInTheDocument();
  });

  it('has fullscreen button', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
    const fullscreenBtn = document.querySelector('[data-icon="fullscreen"]');
    expect(fullscreenBtn).toBeTruthy();
  });

  it('renders all KPI cards by default', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders chart section', async () => {
    await renderDashboard();
    await waitFor(() => {
      const charts = screen.getAllByTestId('echarts-mock');
      expect(charts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
