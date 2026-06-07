import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'r-1', repairNo: 'RP-20260501', title: '水管漏水', renterName: '张三', unitNumber: 'A-101', repairType: 'PLUMBING', urgency: 'HIGH', status: 'SUBMITTED', submittedAt: '2026-05-25T08:00:00Z' },
    { id: 'r-2', repairNo: 'RP-20260502', title: '电灯不亮', renterName: '李四', unitNumber: 'B-202', repairType: 'ELECTRICAL', urgency: 'NORMAL', status: 'ASSIGNED', engineerName: '王工', submittedAt: '2026-05-24T09:00:00Z' },
    { id: 'r-3', repairNo: 'RP-20260503', title: '门锁坏了', renterName: '王五', unitNumber: 'C-303', repairType: 'LOCK', urgency: 'URGENT', status: 'COMPLETED', engineerName: '赵工', submittedAt: '2026-05-23T10:00:00Z', completedAt: '2026-05-24T14:00:00Z' },
  ],
  total: 3,
};

vi.mock('@/services/repair.service', () => ({
  repairService: {
    list: vi.fn().mockResolvedValue(mockData),
  },
}));

describe('RepairListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../service/repairs/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('报修工单')).toBeInTheDocument();
    });
  });

  it('renders repair orders', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('RP-20260501')).toBeInTheDocument();
    });
    expect(screen.getByText('RP-20260502')).toBeInTheDocument();
    expect(screen.getByText('RP-20260503')).toBeInTheDocument();
  });

  it('renders repair titles', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('水管漏水')).toBeInTheDocument();
    });
    expect(screen.getByText('电灯不亮')).toBeInTheDocument();
    expect(screen.getByText('门锁坏了')).toBeInTheDocument();
  });

  it('renders renter names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  it('renders status tabs', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  it('renders search filter', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('工单号/租户/单元号')).toBeInTheDocument();
    });
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 3 条')).toBeInTheDocument();
    });
  });
});
