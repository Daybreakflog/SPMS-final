export interface Project {
  id: string;
  name: string;
  code?: string;
  companyId: string;
  // 真实后端以嵌套关系返回公司信息（company:{id,name,code}），不返回扁平的 companyName。
  // MSW mock 仍提供扁平 companyName，故两者都保留，读取时优先 company?.name。
  companyName?: string;
  company?: { id: string; name: string; code?: string };
  address: string;
  manager?: string;
  contactPhone?: string;
  areaUnit?: string;
  billingStartDate?: string;
  remark?: string;
  // 后端 status 为数字：1 启用 / 0 禁用
  status: number;
  // ⚠ 真实后端 GET /projects 当前**不返回**以下聚合字段，需后端补充统计后才有值。
  buildingCount?: number;
  unitCount?: number;
  occupancyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export function isProjectActive(status: number): boolean {
  return status === 1;
}

export interface ProjectUser {
  id: string;
  username: string;
  realName: string;
  phone: string;
  roles: string[];
}
