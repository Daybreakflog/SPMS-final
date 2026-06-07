import type { PageParams } from './common';

export interface FeeItemListParams extends PageParams {
  keyword?: string;
  billingRule?: string;
  projectId?: string;
  status?: string;
}

export interface FeeItemCreateDTO {
  name: string;
  code?: string;
  billingRule: 'FIXED' | 'BY_AREA' | 'BY_METER';
  unitPrice: number;
  unit?: string;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  projectId?: string;
  projectName?: string;
  status?: 'ACTIVE' | 'DISABLED';
  remark?: string;
}

export type FeeItemUpdateDTO = Partial<FeeItemCreateDTO>;

export interface BillListParams extends PageParams {
  keyword?: string;
  status?: string;
  renterId?: string;
  unitId?: string;
  feeItemId?: string;
  periodStart?: string;
  periodEnd?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface BillManualCreateDTO {
  renterId: string;
  renterName?: string;
  unitId: string;
  unitNumber?: string;
  feeItemId: string;
  feeItemName?: string;
  period: string;
  amount: number;
  dueDate?: string;
  remark?: string;
}

export interface BillGenerateDTO {
  projectIds: string[];
  feeItemIds: string[];
  period: string;
  overrideExisting?: boolean;
}

export interface BillGenerateResult {
  total: number;
  created: number;
  skipped: number;
}

export interface MeterReadingImportParams {
  projectId: string;
  feeItemId: string;
  periodStart: string;
  periodEnd: string;
  file: File;
}

export interface PaymentOrderListParams extends PageParams {
  keyword?: string;
  status?: string;
  channel?: string;
  renterId?: string;
  startTime?: string;
  endTime?: string;
  amountMin?: number;
  amountMax?: number;
}
