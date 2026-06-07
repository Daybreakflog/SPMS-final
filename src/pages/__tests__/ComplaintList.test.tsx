import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockComplaints = {
  items: [
    {
      id: 'cpl-001',
      complaintNo: 'CPL-2026-001',
      title: '物业服务态度差',
      description: '前台服务态度不好',
      complainantId: 'renter-001',
      complainantName: '张伟',
      complainantPhone: '13800138000',
      targetType: 'STAFF',
      targetName: '前台小王',
      severity: 'MEDIUM',
      status: 'SUBMITTED',
      assigneeId: null,
      assigneeName: null,
      closedAt: null,
      closedReason: null,
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'cpl-002',
      complaintNo: 'CPL-2026-002',
      title: '电梯故障频繁',
      description: '电梯经常出故障',
      complainantId: 'renter-002',
      complainantName: '李芳',
      complainantPhone: '13900139000',
      targetType: 'FACILITY',
      targetName: '1号楼电梯',
      severity: 'HIGH',
      status: 'ANALYZING',
      assigneeId: 'user-ops-1',
      assigneeName: '运营张三',
      closedAt: null,
      closedReason: null,
      createdAt: '2026-01-12T10:00:00Z',
      updatedAt: '2026-01-12T10:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

vi.mock('@/services/complaint.service', () => ({
  complaintService: {
    list: vi.fn().mockResolvedValue(mockComplaints),
  },
}));

describe('ComplaintListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../service/complaints/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('投诉受理')).toBeInTheDocument();
    });
  });

  it('renders complaint numbers', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('CPL-2026-001')).toBeInTheDocument();
      expect(screen.getByText('CPL-2026-002')).toBeInTheDocument();
    });
  });

  it('renders complainant names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeInTheDocument();
      expect(screen.getByText('李芳')).toBeInTheDocument();
    });
  });

  it('renders complaint titles', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('物业服务态度差')).toBeInTheDocument();
      expect(screen.getByText('电梯故障频繁')).toBeInTheDocument();
    });
  });

  it('renders status tabs', async () => {
    await renderPage();
    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders target names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('前台小王')).toBeInTheDocument();
      expect(screen.getByText('1号楼电梯')).toBeInTheDocument();
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
