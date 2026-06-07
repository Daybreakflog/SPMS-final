import type { CoResident } from '../api/lease';

export interface Lease {
  id: string;
  renterId: string;
  renterName: string;
  renterPhone?: string;
  unitId: string;
  unitNumber: string;
  buildingName?: string;
  projectId?: string;
  projectName?: string;
  checkInDate: string;
  checkOutDate?: string;
  status: string;
  contractId?: string;
  coResidents?: CoResident[];
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}
