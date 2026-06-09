import { http } from '@/api/request';
import type { DashboardOverview, DashboardOverviewParams } from '@/types';

// 后端仅有 /dashboard/overview 与 /dashboard/tenant-home 两个接口；
// 原 trend / repair-distribution / todos / latest-announcements / expiring-contracts 都不存在，已移除。
export const dashboardService = {
  overview: (params?: DashboardOverviewParams) => http.get<DashboardOverview>('/dashboard/overview', params),
  tenantHome: () => http.get<unknown>('/dashboard/tenant-home'),
};
