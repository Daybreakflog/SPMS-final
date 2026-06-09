// 后端 RenterProfile 响应（来自实际抓包）：
//   { id, companyId, name, type:'PERSON'|'COMPANY', phone, idNumber, creditCode|null,
//     contactName, remark, status:number, createdAt, updatedAt, company:{id,name} }
export interface Renter {
  id: string;
  companyId: string;
  name: string;
  type?: 'PERSON' | 'COMPANY';
  phone?: string;
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  creditCode?: string | null;
  contactName?: string;
  remark?: string | null;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  company?: { id: string; name: string };
}

export interface RenterAccount {
  id: string;
  renterProfileId: string;
  username: string;
  phone?: string | null;
  status: number;
  createdAt?: string;
}
