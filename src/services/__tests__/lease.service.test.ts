import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { leaseService } from '../lease.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('leaseService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /leases', async () => {
    await leaseService.list({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/leases', { page: 1 });
  });

  it('detail 调用 GET /leases/:id', async () => {
    await leaseService.detail('l-001');
    expect(m.get).toHaveBeenCalledWith('/leases/l-001');
  });

  it('checkIn 调用 POST /leases/check-in', async () => {
    const dto = { projectId: 'p-001', unitId: 'u-001', renterProfileId: 'r-001', checkInDate: '2024-01-01' };
    await leaseService.checkIn(dto);
    expect(m.post).toHaveBeenCalledWith('/leases/check-in', dto);
  });

  it('checkOut 调用 POST /leases/:id/check-out', async () => {
    const dto = { checkOutDate: '2024-12-31', reason: '合同到期' };
    await leaseService.checkOut('l-001', dto);
    expect(m.post).toHaveBeenCalledWith('/leases/l-001/check-out', dto);
  });

  it('list 过滤 status=ACTIVE', async () => {
    await leaseService.list({ page: 1, status: 'ACTIVE' });
    expect(m.get).toHaveBeenCalledWith('/leases', expect.objectContaining({ status: 'ACTIVE' }));
  });

  it('list 过滤 unitId', async () => {
    await leaseService.list({ page: 1, unitId: 'unit-001' });
    expect(m.get).toHaveBeenCalledWith('/leases', expect.objectContaining({ unitId: 'unit-001' }));
  });

  it('checkIn 传递所有必填字段', async () => {
    const dto = { projectId: 'p-001', unitId: 'u-002', renterProfileId: 'r-002', checkInDate: '2024-06-01' };
    await leaseService.checkIn(dto);
    expect(m.post).toHaveBeenCalledWith('/leases/check-in', expect.objectContaining({ renterProfileId: 'r-002' }));
  });

  it('checkOut 使用正确的 id', async () => {
    await leaseService.checkOut('l-999', { checkOutDate: '2025-01-01' });
    expect(m.post).toHaveBeenCalledWith('/leases/l-999/check-out', expect.anything());
  });
});
