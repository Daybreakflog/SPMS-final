import type { PageParams } from './common';

export interface FeeItemListParams extends PageParams {
  projectId?: string;
  code?: string;
  status?: string;
}

// 对应后端 CreateFeeItemDto
export interface FeeItemCreateDTO {
  projectId: string;
  name: string;
  code: string;
  billingRule: 'FIXED' | 'BY_AREA' | 'BY_METER';
  unitPrice: number;
  cycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  status?: number;
}

// 对应后端 UpdateFeeItemDto（不允许改 projectId / code）
export interface FeeItemUpdateDTO {
  name?: string;
  billingRule?: 'FIXED' | 'BY_AREA' | 'BY_METER';
  unitPrice?: number;
  cycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  status?: number;
}

export interface BillListParams extends PageParams {
  projectId?: string;
  renterProfileId?: string;
  status?: string;
  published?: boolean;
  keyword?: string;
}

// 对应后端 ManualBillItemDto —— 一张账单可以挂多条费用项
export interface BillItemDTO {
  feeItemId?: string;
  name: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  remark?: string;
}

// 对应后端 CreateManualBillDto —— 整张账单（发票式：一张账单 N 个 items）
export interface BillManualCreateDTO {
  projectId: string;
  renterProfileId: string;
  billDate: string;
  dueDate: string;
  items: BillItemDTO[];
  remark?: string;
}

// 对应后端 GenerateBillDto —— 注意是单个 projectId，不是数组
export interface BillGenerateDTO {
  projectId: string;
  billDate: string;
  renterProfileIds?: string[];
  feeItemIds?: string[];
}

export interface BillGenerateResult {
  total: number;
  created: number;
  skipped: number;
}

// 对应后端 PublishBillDto
export interface BillPublishDTO {
  billIds: string[];
}

export interface MeterReadingImportParams {
  projectId: string;
  feeItemId: string;
  periodStart: string;
  periodEnd: string;
  file: File;
}

export interface PaymentOrderListParams extends PageParams {
  renterAccountId?: string;
  status?: string;
}
