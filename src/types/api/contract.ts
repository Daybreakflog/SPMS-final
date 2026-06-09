import type { PageParams } from './common';

export interface ContractListParams extends PageParams {
  keyword?: string;
  status?: string;
  renterProfileId?: string;
  contractNo?: string;
}

// 对应后端 CreateContractDto
export interface ContractCreateDTO {
  projectId: string;
  renterProfileId: string;
  unitId?: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount?: number;
  paymentMethod: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  terms?: string;
  attachmentUrl?: string;
}

// 对应后端 UpdateContractDto（不允许改 renterProfileId / projectId / contractNo）
export interface ContractUpdateDTO {
  unitId?: string;
  startDate?: string;
  endDate?: string;
  rentAmount?: number;
  depositAmount?: number;
  paymentMethod?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  terms?: string;
  attachmentUrl?: string;
}

// 对应后端 ContractActionDto（审批通过/驳回/终止 全部用这个）
export interface ContractActionDTO {
  comment?: string;
}

/** @deprecated 使用 ContractActionDTO */
export type ContractApproveDTO = ContractActionDTO;
/** @deprecated 使用 ContractActionDTO */
export type ContractRejectDTO = ContractActionDTO;
/** @deprecated 使用 ContractActionDTO */
export type ContractTerminateDTO = ContractActionDTO;

// 对应后端 RenewContractDto
export interface ContractRenewDTO {
  contractNo: string;
  startDate: string;
  endDate: string;
  rentAmount?: number;
  depositAmount?: number;
  paymentMethod?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  terms?: string;
}
