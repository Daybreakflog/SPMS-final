import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn() },
}));

import { dashboardService } from '../dashboard.service';
import { http } from '@/api/request';

const mockGet = (http as unknown as { get: ReturnType<typeof vi.fn> }).get;

describe('dashboardService', () => {
  beforeEach(() => { vi.clearAllMocks(); mockGet.mockResolvedValue({}); });

  it('overview 调用 GET /dashboard/overview', async () => {
    await dashboardService.overview();
    expect(mockGet).toHaveBeenCalledWith('/dashboard/overview', undefined);
  });

  it('overview 支持 projectId 参数', async () => {
    await dashboardService.overview({ projectId: 'p-001' });
    expect(mockGet).toHaveBeenCalledWith('/dashboard/overview', { projectId: 'p-001' });
  });

  it('tenantHome 调用 GET /dashboard/tenant-home', async () => {
    await dashboardService.tenantHome();
    expect(mockGet).toHaveBeenCalledWith('/dashboard/tenant-home');
  });

  it('overview 没有参数时传 undefined', async () => {
    await dashboardService.overview();
    expect(mockGet).toHaveBeenCalledWith('/dashboard/overview', undefined);
  });

  it('overview 支持 projectId 参数(不传时为 undefined)', async () => {
    await dashboardService.overview({});
    expect(mockGet).toHaveBeenCalledWith('/dashboard/overview', {});
  });

  it('overview 支持多项目 projectId', async () => {
    await dashboardService.overview({ projectId: 'p-002' });
    expect(mockGet).toHaveBeenCalledWith('/dashboard/overview', expect.objectContaining({ projectId: 'p-002' }));
  });

  it('多次调用 overview 计数正确', async () => {
    await dashboardService.overview();
    await dashboardService.overview({ projectId: 'p-001' });
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
