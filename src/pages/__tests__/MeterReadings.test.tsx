import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/billing.service', () => ({
  billingService: {
    meterReadingTemplate: vi.fn().mockResolvedValue(new Blob()),
    meterReadingImport: vi.fn().mockResolvedValue({ success: 8, failed: 2, errors: ['行3：单元号不存在'] }),
    feeItemList: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('@/store/user.store', () => ({
  useUserStore: vi.fn((sel: (s: Record<string, unknown>) => unknown) => {
    const state = {
      user: {
        id: 'u1',
        username: 'admin',
        realName: '管理员',
        roles: ['PLATFORM_ADMIN'],
        companyId: 'c1',
        companyName: '测试公司',
        projectIds: [],
      },
    };
    return sel(state);
  }),
}));

describe('MeterReadingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../billing/meter-readings/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('抄表导入')).toBeInTheDocument();
    });
  });

  it('renders step indicators', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.querySelector('.ant-steps')).toBeInTheDocument();
    });
  });

  it('renders download description', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/请先下载抄表导入模板/)).toBeInTheDocument();
    });
  });

  it('renders download button in first step', async () => {
    await renderPage();
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /下载模板/ });
      expect(btn).toBeInTheDocument();
    });
  });

  it('has all four steps', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      const items = container.querySelectorAll('.ant-steps-item');
      expect(items.length).toBe(4);
    });
  });

  it('starts on the first step', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText(/请先下载抄表导入模板/)).toBeInTheDocument();
    });
  });

  it('renders the page without errors', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.querySelector('.ant-steps')).toBeInTheDocument();
    });
  });
});
