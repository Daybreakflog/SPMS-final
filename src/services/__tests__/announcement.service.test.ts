import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { announcementService } from '../announcement.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('announcementService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /announcements', async () => {
    await announcementService.list({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/announcements', { page: 1 });
  });

  it('detail 调用 GET /announcements/:id', async () => {
    await announcementService.detail('a-001');
    expect(m.get).toHaveBeenCalledWith('/announcements/a-001');
  });

  it('create 调用 POST /announcements', async () => {
    await announcementService.create({ title: '公告', content: '内容', projectId: 'p-001' });
    expect(m.post).toHaveBeenCalledWith('/announcements', expect.objectContaining({ title: '公告' }));
  });

  it('update 调用 PATCH /announcements/:id', async () => {
    await announcementService.update('a-001', { title: '新标题' });
    expect(m.patch).toHaveBeenCalledWith('/announcements/a-001', { title: '新标题' });
  });

  it('remove 调用 DELETE /announcements/:id', async () => {
    await announcementService.remove('a-001');
    expect(m.delete).toHaveBeenCalledWith('/announcements/a-001');
  });

  it('publish 调用 PATCH /announcements/:id', async () => {
    await announcementService.publish('a-001');
    expect(m.patch).toHaveBeenCalledWith('/announcements/a-001', { publish: true });
  });
});
