// 后端 Lease 响应（来自实际抓包）：
//   { id, projectId, unitId, renterProfileId, checkInDate, checkOutDate|null,
//     status, remark, createdAt, updatedAt,
//     project:{id,name}, unit:{id,name,code}, renterProfile:{id,name,phone} }
// 后端**不返回** contractId / coResidents / buildingName 等关联字段。
export interface Lease {
  id: string;
  projectId: string;
  unitId: string;
  renterProfileId: string;
  checkInDate: string;
  checkOutDate?: string | null;
  status: string;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
  unit?: { id: string; name: string; code?: string };
  renterProfile?: { id: string; name: string; phone?: string };
}
