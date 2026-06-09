import type { PageParams } from './common';

export interface LeaseListParams extends PageParams {
  projectId?: string;
  unitId?: string;
  renterProfileId?: string;
  status?: string;
}

// 对应后端 CheckInDto
//   合同签署进入 ACTIVE 时后端会自动建 lease，多数场景不需要手动调 check-in
export interface CheckInDTO {
  projectId: string;
  unitId: string;
  renterProfileId: string;
  checkInDate: string;
  remark?: string;
}

// 对应后端 CheckOutDto
export interface CheckOutDTO {
  checkOutDate?: string;
  remark?: string;
}
