import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { contractService } from '../contract.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('contractService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /contracts', async () => {
    await contractService.list({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/contracts', { page: 1 });
  });

  it('detail 调用 GET /contracts/:id', async () => {
    await contractService.detail('ct-001');
    expect(m.get).toHaveBeenCalledWith('/contracts/ct-001');
  });

  it('create 调用 POST /contracts', async () => {
    const dto = { projectId: 'p-001', renterProfileId: 'r-001', contractNo: 'CT-001', startDate: '2024-01-01', endDate: '2025-01-01', rentAmount: 3000, paymentMethod: 'MONTHLY' as const };
    await contractService.create(dto);
    expect(m.post).toHaveBeenCalledWith('/contracts', dto);
  });

  it('update 调用 PATCH /contracts/:id', async () => {
    await contractService.update('ct-001', { rentAmount: 3500 });
    expect(m.patch).toHaveBeenCalledWith('/contracts/ct-001', { rentAmount: 3500 });
  });

  it('remove 调用 DELETE /contracts/:id', async () => {
    await contractService.remove('ct-001');
    expect(m.delete).toHaveBeenCalledWith('/contracts/ct-001');
  });

  it('submit 调用 POST /contracts/:id/submit（带空 body，对应后端 ContractActionDto）', async () => {
    await contractService.submit('ct-001');
    expect(m.post).toHaveBeenCalledWith('/contracts/ct-001/submit', {});
  });
});
