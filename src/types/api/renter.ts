import type { PageParams } from './common';

export interface RenterListParams extends PageParams {
  keyword?: string;
  projectId?: string;
  bindStatus?: string;
}

export interface RenterCreateDTO {
  name: string;
  gender?: string;
  birthDate?: string;
  idType: string;
  idNumber: string;
  phone: string;
  phoneAlt?: string;
  email?: string;
  emergencyContact?: string;
  company?: string;
  position?: string;
  attachments?: string[];
  remark?: string;
}

export type RenterUpdateDTO = Partial<RenterCreateDTO>;

export interface RenterAccountCreateDTO {
  username: string;
  password: string;
}

export interface RenterAccountUpdateDTO {
  status?: string;
}

export interface RenterResetPasswordDTO {
  newPassword: string;
}
