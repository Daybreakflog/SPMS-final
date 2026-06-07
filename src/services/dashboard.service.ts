import { http } from '@/api/request';
import type { DashboardOverview, DashboardOverviewParams, CollectionTrend, RepairStatusDistribution, TodoItem, AnnouncementBrief, ExpiringContract } from '@/types';

export const dashboardService = {
  overview:     (params?: DashboardOverviewParams) => http.get<DashboardOverview>('/dashboard/overview', params),
  trend:        (params?: DashboardOverviewParams) => http.get<CollectionTrend[]>('/dashboard/trend', params),
  repairDist:   (params?: DashboardOverviewParams) => http.get<RepairStatusDistribution[]>('/dashboard/repair-distribution', params),
  todoList:     () => http.get<TodoItem[]>('/dashboard/todos'),
  latestNotice: () => http.get<AnnouncementBrief[]>('/dashboard/latest-announcements'),
  expiringContracts: (days: number) => http.get<ExpiringContract[]>('/dashboard/expiring-contracts', { days }),
};
