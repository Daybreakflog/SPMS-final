import type { PageParams } from './common';

export interface LeaseListParams extends PageParams {
  keyword?: string;
  unitId?: string;
  projectId?: string;
  status?: string;
  checkInStart?: string;
  checkInEnd?: string;
  checkOutStart?: string;
  checkOutEnd?: string;
}

export interface CheckInDTO {
  renterId: string;
  unitId: string;
  checkInDate: string;
  contractId?: string;
  coResidents?: CoResident[];
  remark?: string;
}

export interface CoResident {
  name: string;
  phone?: string;
  idNumber?: string;
  relation?: string;
}

export interface CheckOutDTO {
  checkOutDate: string;
  reason?: string;
  remark?: string;
}
