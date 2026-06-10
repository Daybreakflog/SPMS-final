export interface Company {
  id: string;
  name: string;
  code?: string;
  contact: string;
  phone: string;
  address?: string;
  // 后端 status 为数字：1 启用 / 0 禁用
  status: number;
  // 后端真实返回的关联计数在 _count 里（projectCount/staffCount 为旧字段，后端不返回）
  _count?: { projects: number; users: number };
  projectCount?: number;
  staffCount?: number;
  createdAt: string;
  updatedAt: string;
}
