import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'l-1', renterName: '张三', unitNumber: 'A-101', buildingName: '1号楼', projectName: '翡翠湾', checkInDate: '2026-01-01', checkOutDate: null, status: 'ACTIVE' },
    { id: 'l-2', renterName: '李四', unitNumber: 'B-202', buildingName: '2号楼', projectName: '阳光城', checkInDate: '2026-02-01', checkOutDate: '2026-04-01', status: 'CHECKED_OUT' },
  ],
  total: 2,
};

vi.mock('@/services/lease.service', () => ({
  leaseService: {
    list: vi.fn().mockResolvedValue(mockData),
    checkIn: vi.fn().mockResolvedValue({}),
    checkOut: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LeaseListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../properties/leases/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('入住记录')).toBeInTheDocument();
    });
  });

  it('renders renter names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('张三').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('李四').length).toBeGreaterThanOrEqual(1);
  });

  it('renders unit numbers', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('A-101').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('B-202').length).toBeGreaterThanOrEqual(1);
  });

  it('renders project names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('翡翠湾').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders status tags', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('在住').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('已退租').length).toBeGreaterThanOrEqual(1);
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 2 条')).toBeInTheDocument();
    });
  });

  it('renders detail buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const btns = screen.getAllByText('详情');
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
