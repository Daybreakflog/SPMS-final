export interface Company {
  id: string;
  name: string;
  creditCode?: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  remark?: string;
  status: 'ACTIVE' | 'DISABLED';
  projectCount: number;
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}
