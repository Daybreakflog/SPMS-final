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
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
