// 后端 Contract 响应（来自实际抓包）：
//   { id, projectId, renterProfileId, unitId, contractNo, startDate, endDate,
//     rentAmount: string, depositAmount: string, paymentMethod, terms|null,
//     attachmentUrl|null, status, createdById, createdAt, updatedAt,
//     project:{...}, renterProfile:{...}, unit:{...} }
//
// 注意 rentAmount/depositAmount 后端返回的是字符串（数据库 Decimal 序列化），不是 number。

export interface Contract {
  id: string;
  projectId: string;
  renterProfileId: string;
  unitId?: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  paymentMethod: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  terms?: string | null;
  attachmentUrl?: string | null;
  status: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: { id: string; name: string };
  renterProfile?: { id: string; name: string; phone?: string };
  unit?: { id: string; name: string; code?: string };
}
