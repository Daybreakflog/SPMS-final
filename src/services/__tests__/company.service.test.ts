import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { companyService } from '../company.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('companyService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /platform/companies', async () => {
    await companyService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledWith('/platform/companies', { page: 1, pageSize: 10 });
  });

  it('detail 调用 GET /platform/companies/:id', async () => {
    await companyService.detail('c-001');
    expect(m.get).toHaveBeenCalledWith('/platform/companies/c-001');
  });

  it('create 调用 POST /platform/companies', async () => {
    await companyService.create({ name: '测试公司', code: 'TEST', contact: '张三', phone: '13800138000' });
    expect(m.post).toHaveBeenCalledWith('/platform/companies', expect.objectContaining({ name: '测试公司' }));
  });

  it('update 调用 PATCH /platform/companies/:id', async () => {
    await companyService.update('c-001', { name: '新名称' });
    expect(m.patch).toHaveBeenCalledWith('/platform/companies/c-001', { name: '新名称' });
  });

  it('remove 调用 DELETE /platform/companies/:id', async () => {
    await companyService.remove('c-001');
    expect(m.delete).toHaveBeenCalledWith('/platform/companies/c-001');
  });
});
