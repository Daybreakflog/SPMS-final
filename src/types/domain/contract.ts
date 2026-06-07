export interface ContractApprovalRecord {
  id: string;
  action: string;
  operatorId: string;
  operatorName: string;
  remark?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  renterId: string;
  renterName: string;
  renterIdNumber?: string;
  unitId: string;
  unitNumber: string;
  buildingName?: string;
  projectId?: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  paymentCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  status: string;
  creatorId?: string;
  creatorName?: string;
  attachments?: string[];
  remark?: string;
  approvalRecords?: ContractApprovalRecord[];
  createdAt?: string;
  updatedAt?: string;
}
