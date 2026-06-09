import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: {
    get: vi.fn(() => Promise.resolve({})),
    post: vi.fn(() => Promise.resolve()),
    put: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve()),
    patch: vi.fn(() => Promise.resolve({})),
  },
}));

import { http } from '@/api/request';
import { repairService } from '@/services/repair.service';

describe('repairService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('detail() GETs /repairs/:id', async () => {
    await repairService.detail('repair-1');
    expect(http.get).toHaveBeenCalledWith('/repairs/repair-1');
  });

  it('list() GETs /repairs with params', async () => {
    await repairService.list({ page: 1, pageSize: 20 });
    expect(http.get).toHaveBeenCalledWith('/repairs', { page: 1, pageSize: 20 });
  });

  it('assign() POSTs /repairs/:id/assign', async () => {
    await repairService.assign('repair-1', { assigneeId: 'w-001' });
    expect(http.post).toHaveBeenCalledWith('/repairs/repair-1/assign', { assigneeId: 'w-001' });
  });

  it('progress() POSTs /repairs/:id/progress', async () => {
    await repairService.progress('repair-1', { content: '正在处理' });
    expect(http.post).toHaveBeenCalledWith('/repairs/repair-1/progress', { content: '正在处理' });
  });

  it('complete() POSTs /repairs/:id/complete', async () => {
    await repairService.complete('repair-1', { content: '已完成' });
    expect(http.post).toHaveBeenCalledWith('/repairs/repair-1/complete', { content: '已完成' });
  });

  it('rating() POSTs /repairs/:id/rating', async () => {
    await repairService.rating('repair-1', { speedScore: 5, qualityScore: 5, comment: '很满意' });
    expect(http.post).toHaveBeenCalledWith('/repairs/repair-1/rating', { speedScore: 5, qualityScore: 5, comment: '很满意' });
  });

  it('getMessages() GETs /repairs/:id/messages', async () => {
    await repairService.getMessages('repair-1');
    expect(http.get).toHaveBeenCalledWith('/repairs/repair-1/messages');
  });

  it('sendMessage() POSTs /repairs/:id/messages', async () => {
    await repairService.sendMessage('repair-1', { content: '您好，请问进度如何？' });
    expect(http.post).toHaveBeenCalledWith('/repairs/repair-1/messages', { content: '您好，请问进度如何？' });
  });

  it('list() 过滤 status=SUBMITTED', async () => {
    await repairService.list({ page: 1, pageSize: 10, status: 'SUBMITTED' });
    expect(http.get).toHaveBeenCalledWith('/repairs', expect.objectContaining({ status: 'SUBMITTED' }));
  });
});
