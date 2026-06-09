import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), put: vi.fn() },
}));

import { userService } from '../user.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('userService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /users', async () => {
    await userService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledWith('/users', { page: 1, pageSize: 10 });
  });

  it('list 支持 companyId 过滤', async () => {
    await userService.list({ companyId: 'c-001' });
    expect(m.get).toHaveBeenCalledWith('/users', expect.objectContaining({ companyId: 'c-001' }));
  });

  it('detail 调用 GET /users/:id', async () => {
    await userService.detail('u-001');
    expect(m.get).toHaveBeenCalledWith('/users/u-001');
  });

  it('create 调用 POST /users', async () => {
    await userService.create({ username: 'test', password: '123', realName: '测试' });
    expect(m.post).toHaveBeenCalledWith('/users', expect.objectContaining({ username: 'test' }));
  });

  it('update 调用 PATCH /users/:id', async () => {
    await userService.update('u-001', { realName: '新名字' });
    expect(m.patch).toHaveBeenCalledWith('/users/u-001', { realName: '新名字' });
  });

  it('remove 调用 DELETE /users/:id', async () => {
    await userService.remove('u-001');
    expect(m.delete).toHaveBeenCalledWith('/users/u-001');
  });

  it('assignRoles 调用 PUT /users/:id/roles', async () => {
    await userService.assignRoles('u-001', { roles: [] });
    expect(m.put).toHaveBeenCalledWith('/users/u-001/roles', { roles: [] });
  });

  it('assignProjects 调用 PUT /users/:id/projects', async () => {
    await userService.assignProjects('u-001', { projectIds: ['p-001'] });
    expect(m.put).toHaveBeenCalledWith('/users/u-001/projects', { projectIds: ['p-001'] });
  });
});
