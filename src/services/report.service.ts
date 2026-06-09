import { http } from '@/api/request';
import type {
  ReportResponse, RentIncomeParams, OverdueParams, RepairAnalysisParams, SatisfactionParams, ReportParams,
  RentIncomeKpi, RentIncomeChart, RentIncomeDetail,
  CollectionRateKpi, CollectionRateChart, CollectionRateDetail,
  OverdueKpi, OverdueChart, OverdueDetail,
  RepairAnalysisKpi, RepairAnalysisChart, RepairAnalysisDetail,
  SatisfactionKpi, SatisfactionChart, SatisfactionDetail,
} from '@/types';

export const reportService = {
  rentIncome: (params: RentIncomeParams) =>
    http.get<ReportResponse<RentIncomeKpi, RentIncomeChart, RentIncomeDetail>>('/reports/financial/rent-income', params as Record<string, unknown>),

  collectionRate: (params: ReportParams) =>
    http.get<ReportResponse<CollectionRateKpi, CollectionRateChart, CollectionRateDetail>>('/reports/financial/collection-rate', params as Record<string, unknown>),

  overdueDetail: (params: OverdueParams) =>
    http.get<ReportResponse<OverdueKpi, OverdueChart, OverdueDetail>>('/reports/financial/overdue-detail', params as Record<string, unknown>),

  repairAnalysis: (params: RepairAnalysisParams) =>
    http.get<ReportResponse<RepairAnalysisKpi, RepairAnalysisChart, RepairAnalysisDetail>>('/reports/operational/repair-analysis', params as Record<string, unknown>),

  satisfaction: (params: SatisfactionParams) =>
    http.get<ReportResponse<SatisfactionKpi, SatisfactionChart, SatisfactionDetail>>('/reports/operational/satisfaction', params as Record<string, unknown>),
};
