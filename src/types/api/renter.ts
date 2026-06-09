import type { PageParams } from './common';

export interface RenterListParams extends PageParams {
  keyword?: string;
  projectId?: string;
  bindStatus?: string;
}

// 对应后端 CreateRenterProfileDto
export interface RenterCreateDTO {
  companyId: string;
  name: string;
  type?: 'PERSON' | 'COMPANY';
  phone?: string;
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
