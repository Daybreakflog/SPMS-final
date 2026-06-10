import type { RoleCode, UserType } from '../enums';

export interface StaffUser {
  id: string;
  username: string;
  realName: string;
  phone: string;
  roles: RoleCode[];
  companyId: string;
  companyName: string;
  projectIds: string[];
  userType: UserType;
  // 后端 status 为数字：1 启用 / 0 禁用
  status?: number;
  email?: string | null;
  avatar?: string | null;
  // 后端 /users 接口返回的嵌套关联（normalizeUser 会把它们摊平到 companyName/projectIds）
  company?: { id: string; name: string; code?: string };
  projects?: Array<{ projectId: string; project?: { id: string; name: string; code?: string } }>;
  createdAt?: string;
  updatedAt?: string;
}
