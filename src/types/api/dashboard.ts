export interface DashboardOverviewParams {
  projectId?: string;
}

export interface DashboardOverview {
  occupancyRate: number;
  occupancyRateTrend: number;
  monthlyReceivable: number;
  monthlyReceivableTrend: number;
  monthlyCollected: number;
  monthlyCollectedTrend: number;
  collectionRate: number;
  collectionRateTrend: number;
  pendingRepairs: number;
  pendingRepairsTrend: number;
  overdueBillsCount: number;
  overdueBillsTrend: number;
  expiringContractsCount: number;
}

export interface CollectionTrend {
  month: string;
  receivable: number;
  collected: number;
}

export interface RepairStatusDistribution {
  status: string;
  label: string;
  count: number;
}

export interface TodoItem {
  id: string;
  type: string;
  title: string;
  description: string;
  targetUrl: string;
  deadline?: string;
  createdAt: string;
}

export interface AnnouncementBrief {
  id: string;
  title: string;
  type: string;
  publishedAt: string;
}

export interface ExpiringContract {
  id: string;
  contractNo: string;
  renterName: string;
  unitNumber: string;
  endDate: string;
  daysRemaining: number;
}
