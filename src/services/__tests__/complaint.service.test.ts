import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { complaintService } from '../complaint.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('complaintService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /complaints', async () => {
    await complaintService.list({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/complaints', { page: 1 });
  });

  it('detail 调用 GET /complaints/:id', async () => {
    await complaintService.detail('c-001');
    expect(m.get).toHaveBeenCalledWith('/complaints/c-001');
  });

  it('create 调用 POST /complaints', async () => {
    const dto = { projectId: 'p-001', title: '投诉标题', content: '投诉内容', targetType: 'PROJECT' as const };
    await complaintService.create(dto);
    expect(m.post).toHaveBeenCalledWith('/complaints', dto);
  });

  it('analyze 调用 POST /complaints/:id/analysis', async () => {
    await complaintService.analyze('c-001', { conclusion: 'VALID' });
    expect(m.post).toHaveBeenCalledWith('/complaints/c-001/analysis', expect.anything());
  });

  it('close 调用 POST /complaints/:id/close', async () => {
    await complaintService.close('c-001', { remark: '已处理' });
    expect(m.post).toHaveBeenCalledWith('/complaints/c-001/close', { remark: '已处理' });
  });
});
