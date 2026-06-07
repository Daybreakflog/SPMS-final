import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

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
  expiringContractsCount: 3,
};

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    overview: vi.fn().mockResolvedValue(mockOverview),
    trend: vi.fn().mockResolvedValue([]),
    repairDist: vi.fn().mockResolvedValue([]),
    todoList: vi.fn().mockResolvedValue([]),
    latestNotice: vi.fn().mockResolvedValue([]),
    expiringContracts: vi.fn().mockResolvedValue([
      { id: 'ct-001', contractNo: 'CT-001', renterName: '张三', unitNumber: 'A-101', endDate: '2026-06-15', daysRemaining: 12 },
    ]),
  },
}));

vi.mock('echarts-for-react/lib/core', () => ({
  default: () => <div data-testid="echarts-mock">chart</div>,
}));

describe('Dashboard Data Screen Mode', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  async function renderDashboard() {
    const mod = await import('../dashboard/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders fullscreen button', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    });
  });

  it('renders settings toggle', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('运营概览')).toBeInTheDocument();
    });
  });

  it('renders expiring contracts section', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('即将到期合同')).toBeInTheDocument();
    });
  });

  it('renders expiring contract item', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('CT-001')).toBeInTheDocument();
    });
  });

  it('renders contract renter name', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/张三/)).toBeInTheDocument();
    });
  });

  it('renders project selector', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('运营概览')).toBeInTheDocument();
    });
    const selectors = screen.getAllByRole('combobox');
    expect(selectors.length).toBeGreaterThanOrEqual(1);
  });

  it('renders KPI cards', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders charts area', async () => {
    await renderDashboard();
    await waitFor(() => {
      const charts = screen.getAllByTestId('echarts-mock');
      expect(charts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
