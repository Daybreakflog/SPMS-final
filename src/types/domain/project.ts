export interface Project {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  address: string;
  manager?: string;
  contactPhone?: string;
  areaUnit?: string;
  billingStartDate?: string;
  remark?: string;
  status: 'ACTIVE' | 'DISABLED';
  buildingCount: number;
  unitCount: number;
  occupancyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUser {
  id: string;
  username: string;
  realName: string;
  phone: string;
  roles: string[];
}
