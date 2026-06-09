import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { renterService } from '@/services/renter.service';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';
import { repairService } from '@/services/repair.service';
import { complaintService } from '@/services/complaint.service';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'r1' }) };
});

vi.mock('@/services/renter.service', () => ({
  renterService: {
    detail: vi.fn(),
    getAccounts: vi.fn(),
  },
}));

vi.mock('@/services/contract.service', () => ({
  contractService: { list: vi.fn() },
}));

vi.mock('@/services/billing.service', () => ({
  billingService: { billList: vi.fn() },
}));

vi.mock('@/services/repair.service', () => ({
  repairService: { list: vi.fn() },
}));

vi.mock('@/services/complaint.service', () => ({
  complaintService: { list: vi.fn() },
}));

vi.mock('@/pages/customers/renters/components/TenantAppPreview', () => ({
  default: () => null,
}));

const renter = {
  id: 'r1', name: '张三', gender: 'MALE', idType: 'ID_CARD', idNumber: '110101199001011234',
  phone: '13800001111', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
};

const contracts = [
  { id: 'c1', contractNo: 'CT-2025001', renterId: 'r1', renterName: '张三', unitId: 'u1', unitNumber: 'A-301', startDate: '2025-01-01', endDate: '2026-01-01', monthlyRent: 5000, deposit: 5000, paymentCycle: 'MONTHLY', status: 'ACTIVE' },
];
const bills = [
  { id: 'b1', billNo: 'BILL-2025001', renterId: 'r1', renterName: '张三', unitId: 'u1', unitNumber: 'A-301', feeItemName: '物业费', period: '2025-05', amount: 500, status: 'UNPAID' },
];
const repairs = [
  { id: 'rp1', repairNo: 'RO-2026001', title: '水管漏水', status: 'PENDING', submittedAt: '2026-06-01T00:00:00Z' },
];
const complaints = [
  { id: 'cp1', complaintNo: 'CO-2026001', title: '噪音投诉', status: 'PENDING', submittedAt: '2026-06-02T00:00:00Z' },
];

async function renderPage() {
  const mod = await import('../customers/renters/detail');
  return renderWithProviders(<mod.default />);
}

describe('RenterDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(renterService.detail).mockResolvedValue(renter as never);
    vi.mocked(renterService.getAccounts).mockResolvedValue([] as never);
    vi.mocked(contractService.list).mockResolvedValue({ items: contracts, total: 1, page: 1, pageSize: 50, totalPages: 1 } as never);
    vi.mocked(billingService.billList).mockResolvedValue({ items: bills, total: 1, page: 1, pageSize: 50, totalPages: 1 } as never);
    vi.mocked(repairService.list).mockResolvedValue({ items: repairs, total: 1, page: 1, pageSize: 50, totalPages: 1 } as never);
    vi.mocked(complaintService.list).mockResolvedValue({ items: complaints, total: 1, page: 1, pageSize: 50, totalPages: 1 } as never);
  });

  it('renders the renter name', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getAllByText('张三').length).toBeGreaterThanOrEqual(1));
  });

  it('renders the contracts and bills tab labels', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同')).toBeInTheDocument());
    expect(screen.getByText('账单')).toBeInTheDocument();
  });

  it('loads contracts filtered by renterId when opening the contracts tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同')).toBeInTheDocument());
    fireEvent.click(screen.getByText('合同'));
    await waitFor(() =>
      expect(contractService.list).toHaveBeenCalledWith(expect.objectContaining({ renterId: 'r1' })),
    );
  });

  it('renders contract rows in the contracts tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同')).toBeInTheDocument());
    fireEvent.click(screen.getByText('合同'));
    expect(await screen.findByText('CT-2025001')).toBeInTheDocument();
  });

  it('loads bills filtered by renterId when opening the bills tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('账单')).toBeInTheDocument());
    fireEvent.click(screen.getByText('账单'));
    await waitFor(() =>
      expect(billingService.billList).toHaveBeenCalledWith(expect.objectContaining({ renterId: 'r1' })),
    );
  });

  it('renders bill rows in the bills tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('账单')).toBeInTheDocument());
    fireEvent.click(screen.getByText('账单'));
    expect(await screen.findByText('BILL-2025001')).toBeInTheDocument();
  });

  it('no longer shows the Sprint placeholder text', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同')).toBeInTheDocument());
    expect(screen.queryByText(/Sprint 3 实现/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sprint 4 实现/)).not.toBeInTheDocument();
  });

  // ===== Sprint 19: 报修投诉 Tab =====
  it('loads repairs and complaints by renterId in the service tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('报修投诉')).toBeInTheDocument());
    fireEvent.click(screen.getByText('报修投诉'));
    await waitFor(() => {
      expect(repairService.list).toHaveBeenCalledWith(expect.objectContaining({ renterId: 'r1' }));
      expect(complaintService.list).toHaveBeenCalledWith(expect.objectContaining({ renterId: 'r1' }));
    });
  });

  it('renders repair rows in the service tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('报修投诉')).toBeInTheDocument());
    fireEvent.click(screen.getByText('报修投诉'));
    expect(await screen.findByText('RO-2026001')).toBeInTheDocument();
  });

  it('renders complaint rows in the service tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('报修投诉')).toBeInTheDocument());
    fireEvent.click(screen.getByText('报修投诉'));
    expect(await screen.findByText('CO-2026001')).toBeInTheDocument();
  });

  it('no longer shows the service placeholder text', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('报修投诉')).toBeInTheDocument());
    fireEvent.click(screen.getByText('报修投诉'));
    await screen.findByText('RO-2026001');
    expect(screen.queryByText(/Sprint 5 实现/)).not.toBeInTheDocument();
  });
});
