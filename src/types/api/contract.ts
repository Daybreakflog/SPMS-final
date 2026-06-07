import type { PageParams } from './common';

export interface ContractListParams extends PageParams {
  keyword?: string;
  status?: string;
  renterId?: string;
  unitId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface ContractCreateDTO {
  renterId: string;
  renterName?: string;
  unitId: string;
  unitNumber?: string;
  projectId?: string;
  projectName?: string;
  buildingName?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  paymentCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  remark?: string;
  attachments?: string[];
}

export interface ContractApproveDTO {
  remark?: string;
}

export interface ContractRejectDTO {
  reason: string;
}

export interface ContractTerminateDTO {
  reason: string;
}

export interface ContractRenewDTO {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  paymentCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  remark?: string;
}
