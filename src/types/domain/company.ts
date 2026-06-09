export interface Company {
  id: string;
  name: string;
  code?: string;
  contact: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'DISABLED';
  projectCount: number;
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}
