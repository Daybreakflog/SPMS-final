import type { RoleCode, UserType } from '../enums';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  realName: string;
  roles: RoleCode[];
  companyId: string;
  companyName: string;
  projectIds: string[];
  userType: UserType;
}

export interface RefreshTokenParams {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}
