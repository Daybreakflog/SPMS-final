import type { PageParams } from './common';

export interface RenterListParams extends PageParams {
  keyword?: string;
  projectId?: string;
  bindStatus?: string;
}

// 对应后端 CreateRenterProfileDto
// ⚠ 后端 DTO 含 email，但 **不含** idFrontUrl / idBackUrl —— 证件影像字段后端不接收（会被静默丢弃）。
export interface RenterCreateDTO {
  companyId: string;
  name: string;
  type?: 'PERSON' | 'COMPANY';
  phone?: string;
  email?: string;
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  creditCode?: string;
  contactName?: string;
  remark?: string;
}

// 对应后端 UpdateRenterProfileDto（多一个 status）
export interface RenterUpdateDTO extends Partial<RenterCreateDTO> {
  status?: number;
}

// 对应后端 CreateRenterAccountDto
export interface RenterAccountCreateDTO {
  username: string;
  password: string;
  phone?: string;
}

// 对应后端 UpdateRenterAccountDto
export interface RenterAccountUpdateDTO {
  phone?: string;
  status?: number;
}

// 对应后端 ResetRenterAccountPasswordDto
export interface RenterResetPasswordDTO {
  password: string;
}
