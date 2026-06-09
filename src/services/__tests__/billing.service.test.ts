import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { billingService } from '../billing.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('billingService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('feeItemList 调用 GET /billing/fee-items', async () => {
    await billingService.feeItemList({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/billing/fee-items', { page: 1 });
  });

  it('feeItemDetail 调用 GET /billing/fee-items/:id', async () => {
    await billingService.feeItemDetail('fi-001');
    expect(m.get).toHaveBeenCalledWith('/billing/fee-items/fi-001');
  });

  it('feeItemCreate 调用 POST /billing/fee-items', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dto = { name: '物业费', unit: '元/月', defaultAmount: 100, type: 'PROPERTY' as const } as any;
    await billingService.feeItemCreate(dto);
    expect(m.post).toHaveBeenCalledWith('/billing/fee-items', dto);
  });

  it('billList 调用 GET /billing/bills', async () => {
    await billingService.billList({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/billing/bills', { page: 1 });
  });

  it('billDetail 调用 GET /billing/bills/:id', async () => {
    await billingService.billDetail('b-001');
    expect(m.get).toHaveBeenCalledWith('/billing/bills/b-001');
  });
});
