import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), patch: vi.fn() },
}));

import { notificationService } from '../notification.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('notificationService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /notifications', async () => {
    await notificationService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledWith('/notifications', { page: 1, pageSize: 10 });
  });

  it('read 调用 PATCH /notifications/:id/read', async () => {
    await notificationService.read('n-001');
    expect(m.patch).toHaveBeenCalledWith('/notifications/n-001/read');
  });

  it('batchRead 调用 PATCH /notifications/read', async () => {
    await notificationService.batchRead(['n-001', 'n-002']);
    expect(m.patch).toHaveBeenCalledWith('/notifications/read', { ids: ['n-001', 'n-002'] });
  });

  it('readAll 调用 PATCH /notifications/read-all', async () => {
    await notificationService.readAll();
    expect(m.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('list 传递 type 参数', async () => {
    await notificationService.list({ page: 1, pageSize: 10, type: 'SYSTEM' });
    expect(m.get).toHaveBeenCalledWith('/notifications', expect.objectContaining({ type: 'SYSTEM' }));
  });

  it('list 传递 read 参数', async () => {
    await notificationService.list({ page: 1, pageSize: 10, read: false });
    expect(m.get).toHaveBeenCalledWith('/notifications', expect.objectContaining({ read: false }));
  });

  it('batchRead 传递空数组', async () => {
    await notificationService.batchRead([]);
    expect(m.patch).toHaveBeenCalledWith('/notifications/read', { ids: [] });
  });

  it('read 使用正确的通知 id', async () => {
    await notificationService.read('n-999');
    expect(m.patch).toHaveBeenCalledWith('/notifications/n-999/read');
  });
});
