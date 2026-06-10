import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn() },
}));

import { auditService } from '../audit.service';
import { http } from '@/api/request';

const mockGet = (http as unknown as { get: ReturnType<typeof vi.fn> }).get;

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({});
  });

  it('list 调用 GET /system/audit-logs', async () => {
    await auditService.list({ page: 1, pageSize: 10 });
    expect(mockGet).toHaveBeenCalledWith('/system/audit-logs', { page: 1, pageSize: 10 });
  });

  it('list 支持模块过滤', async () => {
    await auditService.list({ module: 'USER', page: 1, pageSize: 10 });
    expect(mockGet).toHaveBeenCalledWith('/system/audit-logs', expect.objectContaining({ module: 'USER' }));
  });

  it('resourceHistory 返回空数组桩（后端无 resource-history 接口）', async () => {
    const result = await auditService.resourceHistory('user-001');
    expect(result).toEqual([]);
    expect(mockGet).not.toHaveBeenCalledWith('/system/audit-logs/resource-history', expect.anything());
  });

  it('resourceHistory 不触发 http 请求', async () => {
    await auditService.resourceHistory('contract-999');
    expect(mockGet).not.toHaveBeenCalled();
  });
});
