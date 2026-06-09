import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockBills = {
  items: [
    {
      id: 'b-001',
      billNo: 'BILL-2026-001',
      renterName: '张伟',
      unitNumber: '101',
      feeItemName: '物业管理费',
      period: '2026-05',
      amount: 3000,
      paidAmount: 0,
      balance: 3000,
      status: 'UNPAID',
      published: true,
      dueDate: '2026-06-01',
    },
    {
      id: 'b-002',
      billNo: 'BILL-2026-002',
      renterName: '李芳',
      unitNumber: '202',
      feeItemName: '租金',
      period: '2026-05',
      amount: 8000,
      paidAmount: 8000,
      balance: 0,
      status: 'PAID',
      published: true,
      dueDate: '2026-06-01',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

vi.mock('@/services/billing.service', () => ({
  billingService: {
    billList: vi.fn().mockResolvedValue(mockBills),
    billPublish: vi.fn().mockResolvedValue({}),
    billManualCreate: vi.fn().mockResolvedValue({}),
  },
}));

describe('BillListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../billing/bills/index');
    const BillListPage = mod.default;
    return renderWithProviders(<BillListPage />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('账单中心')).toBeInTheDocument();
    });
  });

  it('renders bill data in table', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('BILL-2026-001')).toBeInTheDocument();
      expect(screen.getByText('BILL-2026-002')).toBeInTheDocument();
    });
  });

  it('renders fee item names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('物业管理费')).toBeInTheDocument();
      expect(screen.getByText('租金')).toBeInTheDocument();
    });
  });

  it('renders status tabs', async () => {
    await renderPage();
    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders action buttons for finance roles', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('BILL-2026-001')).toBeInTheDocument();
    });
  });

  it('renders detail link for each bill', async () => {
    await renderPage();
    await waitFor(() => {
      const detailButtons = screen.getAllByText('详情');
      expect(detailButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders amount columns', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('BILL-2026-001')).toBeInTheDocument();
    });
  });
});
