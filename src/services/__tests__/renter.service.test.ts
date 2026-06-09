import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() },
}));

import { renterService } from '../renter.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('renterService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /renters', async () => {
    await renterService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledWith('/renters', expect.objectContaining({ page: 1 }));
  });

  it('detail 调用 GET /renters/:id', async () => {
    await renterService.detail('r-001');
    expect(m.get).toHaveBeenCalledWith('/renters/r-001');
  });

  it('create 调用 POST /renters', async () => {
    await renterService.create({ companyId: 'c-001', name: '张三' });
    expect(m.post).toHaveBeenCalledWith('/renters', expect.objectContaining({ name: '张三' }));
  });

  it('update 调用 PUT /renters/:id', async () => {
    await renterService.update('r-001', { name: '新名字' });
    expect(m.put).toHaveBeenCalledWith('/renters/r-001', { name: '新名字' });
  });

  it('remove 调用 DELETE /renters/:id', async () => {
    await renterService.remove('r-001');
    expect(m.delete).toHaveBeenCalledWith('/renters/r-001');
  });

  it('getAccounts 调用 GET /renters/:id/accounts', async () => {
    await renterService.getAccounts('r-001');
    expect(m.get).toHaveBeenCalledWith('/renters/r-001/accounts');
  });
});
