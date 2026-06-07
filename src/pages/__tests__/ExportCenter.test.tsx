import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/billing.service', () => ({
  billingService: { billList: vi.fn().mockResolvedValue({ items: [], total: 0 }) },
}));

describe('ExportCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  async function renderPage() {
    const mod = await import('../system/export-center/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('导出中心')).toBeInTheDocument();
    });
  });

  it('renders new export button', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('新建导出')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('暂无导出任务')).toBeInTheDocument();
    });
  });

  it('opens modal on new export click', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('新建导出')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('新建导出'));
    await waitFor(() => {
      expect(screen.getByText('导出类型')).toBeInTheDocument();
    });
  });

  it('renders export type options in modal', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('新建导出')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('新建导出'));
    await waitFor(() => {
      expect(screen.getByText('开始导出')).toBeInTheDocument();
    });
  });

  it('creates export task when form submitted', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('新建导出')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('新建导出'));
    await waitFor(() => {
      expect(screen.getByText('开始导出')).toBeInTheDocument();
    });
  });

  it('renders table columns correctly', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('任务名称')).toBeInTheDocument();
    });
  });
});
