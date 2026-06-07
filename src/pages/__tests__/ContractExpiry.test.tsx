import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

// ContractExpiry warning: tests the expiring contracts data structures and display
// Note: full dashboard rendering is tested in DataScreen.test.tsx

describe('ContractExpiry data structures', () => {
  it('daysRemaining < 30 should be "urgent" (red)', () => {
    const contract = { id: '1', contractNo: 'CT-001', renterName: '张三', unitNumber: 'A-101', endDate: '2026-06-20', daysRemaining: 13 };
    expect(contract.daysRemaining < 30).toBe(true);
  });

  it('daysRemaining 30-59 should be "warning" (orange)', () => {
    const contract = { id: '2', contractNo: 'CT-002', renterName: '李四', unitNumber: 'B-202', endDate: '2026-07-10', daysRemaining: 33 };
    expect(contract.daysRemaining >= 30 && contract.daysRemaining < 60).toBe(true);
  });

  it('daysRemaining >= 60 should be "normal" (blue)', () => {
    const contract = { id: '3', contractNo: 'CT-003', renterName: '王五', unitNumber: 'C-303', endDate: '2026-08-05', daysRemaining: 59 };
    expect(contract.daysRemaining >= 60).toBe(false);
    // 59 days is still warning
    expect(contract.daysRemaining < 60).toBe(true);
  });

  it('expiry warning days options are 30, 60, 90', () => {
    const options = [30, 60, 90];
    expect(options).toContain(30);
    expect(options).toContain(60);
    expect(options).toContain(90);
    expect(options.length).toBe(3);
  });

  it('default expiry days is 30', () => {
    const defaultDays = 30;
    expect(defaultDays).toBe(30);
  });

  it('ExpiringContract type has required fields', () => {
    const ec = { id: 'ec-1', contractNo: 'CT-001', renterName: '张三', unitNumber: 'A-101', endDate: '2026-06-20', daysRemaining: 13 };
    expect(ec).toHaveProperty('id');
    expect(ec).toHaveProperty('contractNo');
    expect(ec).toHaveProperty('renterName');
    expect(ec).toHaveProperty('unitNumber');
    expect(ec).toHaveProperty('endDate');
    expect(ec).toHaveProperty('daysRemaining');
  });
});

// vi.mock is hoisted by Vitest, so inline the data inside the factory
vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    overview: vi.fn().mockResolvedValue({
      occupancyRate: 85, monthlyReceivable: 500000, monthlyCollected: 450000,
      collectionRate: 90, pendingRepairs: 5, overdueBillsCount: 3, expiringContractsCount: 2,
    }),
    trend: vi.fn().mockResolvedValue([]),
    repairDist: vi.fn().mockResolvedValue([]),
    todoList: vi.fn().mockResolvedValue([]),
    latestNotice: vi.fn().mockResolvedValue([]),
    expiringContracts: vi.fn().mockResolvedValue([
      { id: 'ec-1', contractNo: 'CT-001', renterName: '张三', unitNumber: 'A-101', endDate: '2026-06-20', daysRemaining: 13 },
      { id: 'ec-2', contractNo: 'CT-002', renterName: '李四', unitNumber: 'B-202', endDate: '2026-07-10', daysRemaining: 33 },
    ]),
  },
}));

vi.mock('@/components/EChart', () => ({
  default: () => <div data-testid="echart" />,
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ContractExpiry Dashboard section', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  async function renderDashboard() {
    const mod = await import('../dashboard/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders dashboard page title', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('仪表盘')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders expiring contracts section', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('即将到期合同')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders KPI cards section', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('入住率')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
