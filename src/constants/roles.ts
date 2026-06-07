import { RoleCode } from '@/types/enums';

export const RoleLabels: Record<RoleCode, string> = {
  [RoleCode.PLATFORM_ADMIN]: '平台超管',
  [RoleCode.COMPANY_ADMIN]: '公司管理员',
  [RoleCode.PROJECT_ADMIN]: '项目管理员',
  [RoleCode.FINANCE]: '财务',
  [RoleCode.CUSTOMER_SERVICE]: '客服',
  [RoleCode.ENGINEER]: '工程',
  [RoleCode.OPERATIONS]: '运营',
  [RoleCode.TENANT]: '租户',
};

export const RoleColors: Record<RoleCode, string> = {
  [RoleCode.PLATFORM_ADMIN]: 'red',
  [RoleCode.COMPANY_ADMIN]: 'volcano',
  [RoleCode.PROJECT_ADMIN]: 'orange',
  [RoleCode.FINANCE]: 'gold',
  [RoleCode.CUSTOMER_SERVICE]: 'cyan',
  [RoleCode.ENGINEER]: 'blue',
  [RoleCode.OPERATIONS]: 'purple',
  [RoleCode.TENANT]: 'green',
};

export const ADMIN_ROLES: RoleCode[] = [
  RoleCode.PLATFORM_ADMIN,
  RoleCode.COMPANY_ADMIN,
  RoleCode.PROJECT_ADMIN,
];

export const ALL_STAFF_ROLES: RoleCode[] = [
  RoleCode.PLATFORM_ADMIN,
  RoleCode.COMPANY_ADMIN,
  RoleCode.PROJECT_ADMIN,
  RoleCode.FINANCE,
  RoleCode.CUSTOMER_SERVICE,
  RoleCode.ENGINEER,
  RoleCode.OPERATIONS,
];
