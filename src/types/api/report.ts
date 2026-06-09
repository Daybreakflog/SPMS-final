export interface ReportParams {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  export?: boolean;
}

export interface RentIncomeParams extends ReportParams {
  period?: string;
}

export interface OverdueParams extends ReportParams {
  overdueOnly?: boolean;
}

export interface RepairAnalysisParams extends ReportParams {
  repairType?: string;
  urgency?: string;
}

export interface SatisfactionParams extends ReportParams {
  ratingRange?: string;
}

export interface ReportResponse<TKpi, TChart, TDetail> {
  kpis: TKpi;
  chartData: TChart[];
  details: {
    items: TDetail[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface RentIncomeKpi { totalIncome: number; yoyGrowth: number; momGrowth: number; avgUnitPrice: number; }
export interface CollectionRateKpi { overallRate: number; collectedTotal: number; uncollectedTotal: number; overdueRate: number; }
export interface OverdueKpi { overdueTotal: number; overdueHouseholds: number; avgOverdueDays: number; maxOverdueAmount: number; }
export interface RepairAnalysisKpi { totalOrders: number; avgProcessTime: number; timeoutRate: number; satisfactionRate: number; }
export interface SatisfactionKpi { avgRating: number; fiveStarRate: number; lowRatingRate: number; totalRatings: number; }

export interface RentIncomeChart { period: string; income: number; yoyGrowth?: number; momGrowth?: number; }
export interface CollectionRateChart { project: string; rate: number; receivable: number; collected: number; }
export interface EngineerRank { engineerName: string; completed: number; avgTime: number; rating: number; timeoutCount: number; }
export interface OverdueChart { range: string; amount: number; count: number; }
export interface RepairAnalysisChart { type: string; count: number; }
export interface SatisfactionChart { month: string; avgRating: number; }

export interface RentIncomeDetail { project: string; month: string; receivable: number; collected: number; collectionRate: number; }
export interface CollectionRateDetail { project: string; receivable: number; collected: number; collectionRate: number; overdueAmount: number; }
export interface OverdueDetail { id: string; renterName: string; unitNumber: string; billNo: string; amount: number; overdueDays: number; phone: string; }
export interface RepairAnalysisDetail { id: string; repairNo: string; repairType: string; urgency: string; processHours: number; rating: number; status: string; }
export interface SatisfactionDetail { id: string; repairNo: string; renterName: string; rating: number; comment: string; ratedAt: string; }
