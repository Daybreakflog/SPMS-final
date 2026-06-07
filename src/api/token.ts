import { storage } from '@/utils/storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return storage.get<string>(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storage.get<string>(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  storage.set(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
}
