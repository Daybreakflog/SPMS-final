import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() },
}));

import { projectService } from '../project.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('projectService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /projects', async () => {
    await projectService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledWith('/projects', { page: 1, pageSize: 10 });
  });

  it('list 支持 companyId 过滤', async () => {
    await projectService.list({ companyId: 'c-001' });
    expect(m.get).toHaveBeenCalledWith('/projects', expect.objectContaining({ companyId: 'c-001' }));
  });

  it('detail 调用 GET /projects/:id', async () => {
    await projectService.detail('p-001');
    expect(m.get).toHaveBeenCalledWith('/projects/p-001');
  });

  it('create 调用 POST /projects', async () => {
    await projectService.create({ name: 'test', code: 'T001', address: '测试地址' });
    expect(m.post).toHaveBeenCalledWith('/projects', expect.objectContaining({ name: 'test' }));
  });

  it('update 调用 PATCH /projects/:id', async () => {
    await projectService.update('p-001', { name: '新名称' });
    expect(m.patch).toHaveBeenCalledWith('/projects/p-001', { name: '新名称' });
  });

  it('remove 调用 DELETE /projects/:id', async () => {
    await projectService.remove('p-001');
    expect(m.delete).toHaveBeenCalledWith('/projects/p-001');
  });

  it('getUsers 返回空数组桩（后端无 GET /projects/:id/users 接口）', async () => {
    const result = await projectService.getUsers('p-001');
    expect(result).toEqual([]);
    expect(m.get).not.toHaveBeenCalledWith('/projects/p-001/users');
  });

  it('assignUsers 调用 PUT /projects/:id/users', async () => {
    await projectService.assignUsers('p-001', { userIds: ['u-001'] });
    expect(m.put).toHaveBeenCalledWith('/projects/p-001/users', { userIds: ['u-001'] });
  });
});
