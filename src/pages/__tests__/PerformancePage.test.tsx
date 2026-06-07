import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('echarts-for-react/lib/core', () => ({
  default: () => <div data-testid="echarts-mock">chart</div>,
}));

vi.mock('@/utils/performance', () => ({
  trackRouteChange: vi.fn(),
}));

describe('PerformancePage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  async function renderPage() {
    const mod = await import('../system/performance/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('性能监控')).toBeInTheDocument();
    });
  });

  it('renders Web Vitals cards', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/LCP/)).toBeInTheDocument();
    });
  });

  it('renders FID metric', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/FID/)).toBeInTheDocument();
    });
  });

  it('renders CLS metric', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/CLS/)).toBeInTheDocument();
    });
  });

  it('renders route performance table', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('路由切换性能')).toBeInTheDocument();
    });
  });

  it('renders performance trend chart', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('性能趋势')).toBeInTheDocument();
    });
  });

  it('renders ECharts mock', async () => {
    await renderPage();
    await waitFor(() => {
      const charts = screen.getAllByTestId('echarts-mock');
      expect(charts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders FCP metric', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/FCP/)).toBeInTheDocument();
    });
  });
});
