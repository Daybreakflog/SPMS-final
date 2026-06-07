import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/report.service', () => ({
  reportService: {
    feeAnalysis: vi.fn().mockResolvedValue({
      totalIncome: 1850000,
      topFeeItem: '物业费',
      projectCount: 3,
      avgIncome: 616666,
      pieData: [
        { name: '物业费', value: 820000 },
        { name: '水费', value: 285000 },
        { name: '电费', value: 362000 },
      ],
      trendData: [
        { month: '2026-01', items: { '物业费': 135000, '水费': 42000 } },
        { month: '2026-02', items: { '物业费': 135000, '水费': 38000 } },
      ],
      projectCompare: [
        { project: '翡翠湾花园', items: { '物业费': 380000, '水费': 125000 } },
      ],
    }),
  },
}));

vi.mock('@/utils/export', () => ({
  exportToExcel: vi.fn(),
}));

vi.mock('@/components/EChart', () => ({
  default: () => <div data-testid="echart" />,
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('FeeAnalysisPage', () => {
  async function renderPage() {
    const mod = await import('../reports/fee-analysis/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('费用统计分析')).toBeInTheDocument();
    });
  });

  it('renders KPI cards', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('总收入')).toBeInTheDocument();
      expect(screen.getByText('项目数')).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    await renderPage();
    await waitFor(() => {
      const charts = screen.getAllByTestId('echart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  it('renders export button', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('导出 Excel')).toBeInTheDocument();
    });
  });
});
