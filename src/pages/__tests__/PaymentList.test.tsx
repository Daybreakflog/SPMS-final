import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'po-1', orderNo: 'PAY-2026-001', renterName: '张三', amount: 5600, channel: 'WECHAT', status: 'SUCCESS', billCount: 2, paidAt: '2026-05-01' },
    { id: 'po-2', orderNo: 'PAY-2026-002', renterName: '李四', amount: 3200, channel: 'ALIPAY', status: 'PENDING', billCount: 1, paidAt: null },
  ],
  total: 2,
};

vi.mock('@/services/payment.service', () => ({
  paymentService: {
    list: vi.fn().mockResolvedValue(mockData),
    mockSuccess: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PaymentOrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../billing/payments/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('支付订单')).toBeInTheDocument();
    });
  });

  it('renders order numbers', async () => {
    await renderPage();
    // 表格存在 fixed 列，AntD 可能复制单元格，故用 getAllByText
    await waitFor(() => {
      expect(screen.getAllByText('PAY-2026-001').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('PAY-2026-002').length).toBeGreaterThanOrEqual(1);
  });

  it('renders renter names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('张三').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('李四').length).toBeGreaterThanOrEqual(1);
  });

  it('renders payment channels', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('微信支付').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('支付宝').length).toBeGreaterThanOrEqual(1);
  });

  it('renders status tags', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('支付成功').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 2 条')).toBeInTheDocument();
    });
  });

  it('renders search filter placeholder', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入订单号/租户名')).toBeInTheDocument();
    });
  });
});
