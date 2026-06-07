import { http } from '@/api/request';
import type { LoginParams, LoginResult, RefreshTokenParams, RefreshTokenResult } from '@/types';

export const authService = {
  login: (data: LoginParams) =>
    http.post<LoginResult>('/auth/staff/login', data),

  refresh: (data: RefreshTokenParams) =>
    http.post<RefreshTokenResult>('/auth/refresh', data),

  logout: () =>
    http.post<void>('/auth/logout'),
};
