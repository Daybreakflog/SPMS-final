import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { contractService } from '@/services/contract.service';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'c1' }) };
});

vi.mock('@/store/user.store', () => ({
  useUserStore: Object.assign(
    vi.fn((sel: (s: Record<string, unknown>) => unknown) => sel({ user: { id: 'u1', roles: ['PLATFORM_ADMIN'] } })),
    { getState: () => ({ user: { id: 'u1', roles: ['PLATFORM_ADMIN'] } }) },
  ),
}));

vi.mock('@/services/contract.service', () => ({
  contractService: { detail: vi.fn(), update: vi.fn() },
}));
vi.mock('@/services/billing.service', () => ({ billingService: { billList: vi.fn() } }));
vi.mock('@/services/repair.service', () => ({ repairService: { list: vi.fn() } }));

const contract = {
  id: 'c1', contractNo: 'CT-2025001', renterName: '张三', unitId: 'u1', unitNumber: 'A-301',
  startDate: '2025-01-01', endDate: '2026-01-01', monthlyRent: 5000, deposit: 5000,
  paymentCycle: 'MONTHLY', status: 'ACTIVE', attachments: [],
  createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z',
  approvalRecords: [
    { action: 'CREATE', operatorName: '李四', remark: '创建合同', createdAt: '2025-01-01T08:00:00Z' },
    { action: 'FINANCE_APPROVE', operatorName: '王五', remark: '财务通过', createdAt: '2025-01-01T09:00:00Z' },
  ],
};

async function renderPage() {
  const mod = await import('../contracts/detail');
  return renderWithProviders(<mod.default open id="c1" onClose={() => {}} />);
}

describe('ContractDetailPage operation log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contractService.detail).mockResolvedValue(contract as never);
  });

  // 注：操作日志/审批记录 Tab 已随真实后端对齐移除（后端无 audit resource-history 接口，
  // 合同详情也不再返回 approvalRecords）。以下用例改为校验当前合同详情的真实行为。
  it('renders the contract number in the detail header', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getAllByText('CT-2025001').length).toBeGreaterThanOrEqual(1));
  });

  it('renders the current contract detail tabs', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同条款')).toBeInTheDocument());
    expect(screen.getByText('关联账单')).toBeInTheDocument();
    expect(screen.getByText('关联工单')).toBeInTheDocument();
  });

  it('no longer renders the removed operation-log tab', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同条款')).toBeInTheDocument());
    expect(screen.queryByText('操作日志')).not.toBeInTheDocument();
  });

  it('no longer shows the Sprint placeholder text', async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByText('合同条款')).toBeInTheDocument());
    expect(screen.queryByText(/待后续 Sprint 实现/)).not.toBeInTheDocument();
  });
});
