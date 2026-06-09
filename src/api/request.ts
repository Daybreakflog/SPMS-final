import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token';
import { getMessageApi } from '@/utils/antd';
import { ApiError } from './error';
import { unwrapResponse } from './adapter';
import { useProjectStore } from '@/store/project.store';
import { sanitizeInput } from '@/utils/sanitize';
import {
  DEFAULT_SESSION_TIMEOUT_MS,
  SESSION_TIMEOUT_CHECK_INTERVAL_MS,
} from '@/constants/session';

interface ErrorResponseData {
  code: number;
  message: string;
}

const MAX_RETRIES = 1;
const RETRY_DELAY_BASE = 300;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

// 会话空闲超时阈值。
// TODO(backend): 后端 /api/system/settings 接口就绪后，登录成功时调用 setSessionTimeoutMs()
//   将 security.sessionTimeout（分钟）写入，覆盖默认值。
let sessionTimeoutMs = DEFAULT_SESSION_TIMEOUT_MS;

export function setSessionTimeoutMs(ms: number): void {
  if (Number.isFinite(ms) && ms > 0) {
    sessionTimeoutMs = ms;
  }
}

let lastActivityTime = Date.now();

function resetActivityTimer() {
  lastActivityTime = Date.now();
}

function checkSessionTimeout() {
  if (Date.now() - lastActivityTime > sessionTimeoutMs && getAccessToken()) {
    clearTokens();
    window.location.href = '/auth/staff/login';
  }
}

if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
    window.addEventListener(evt, resetActivityTimer, { passive: true }),
  );
  setInterval(checkSessionTimeout, SESSION_TIMEOUT_CHECK_INTERVAL_MS);
}

interface RetryConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 8_000,
  headers: { 'Content-Type': 'application/json' },
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  resetActivityTimer();

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CSRF Token
  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // 多租户：自动注入当前选中项目 ID
  const currentProject = useProjectStore.getState().currentProject;
  if (currentProject?.id) {
    config.headers['X-Project-Id'] = currentProject.id;
  }

  // XSS sanitize outgoing data
  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = sanitizeInput(config.data);
  }

  return config;
});

let refreshing: Promise<string> | null = null;
const pendingQueue: Array<(token: string) => void> = [];

request.interceptors.response.use(
  (resp) => unwrapResponse(resp).data,
  async (err: AxiosError<ErrorResponseData>) => {
    const { response, config } = err;

    if (!response) {
      const retryConfig = config as RetryConfig;
      const retryCount = retryConfig?._retryCount ?? 0;
      const method = config?.method?.toLowerCase() ?? '';
      if (RETRYABLE_METHODS.has(method) && retryCount < MAX_RETRIES && config) {
        (config as RetryConfig)._retryCount = retryCount + 1;
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
        await new Promise((r) => setTimeout(r, delay));
        return request(config);
      }
      getMessageApi()?.error('网络异常，请检查网络连接');
      return Promise.reject(new ApiError(-1, '网络异常'));
    }

    const { status } = response;
    const errorData = response.data;
    const errorMsg = errorData?.message ?? `请求失败（${status}）`;

    if (status === 401 && config && !config.url?.includes('/auth/refresh')) {
      if (!refreshing) {
        const rt = getRefreshToken();
        if (!rt) {
          clearTokens();
          window.location.href = '/auth/staff/login';
          return Promise.reject(new ApiError(401, '登录已过期'));
        }

        refreshing = axios
          .post<RefreshResponse>(
            `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/auth/refresh`,
            { refreshToken: rt },
          )
          .then((r) => {
            const { accessToken, refreshToken: newRt } = r.data;
            setTokens(accessToken, newRt);
            pendingQueue.forEach((cb) => cb(accessToken));
            pendingQueue.length = 0;
            return accessToken;
          })
          .catch(() => {
            clearTokens();
            pendingQueue.length = 0;
            window.location.href = '/auth/staff/login';
            throw new ApiError(401, '登录已过期');
          })
          .finally(() => {
            refreshing = null;
          });
      }

      return new Promise((resolve) => {
        pendingQueue.push((newToken: string) => {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(request(config));
        });
      });
    }

    if (status === 403) {
      getMessageApi()?.error('没有权限执行此操作');
      window.location.href = '/403';
      return Promise.reject(new ApiError(403, '没有权限'));
    } else if (status >= 400) {
      getMessageApi()?.error(errorMsg);
    }

    return Promise.reject(new ApiError(errorData?.code ?? status, errorMsg));
  },
);

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// 开发环境请求/响应日志
if (import.meta.env.DEV) {
  request.interceptors.request.use((config) => {
    console.debug(`[API →] ${config.method?.toUpperCase()} ${config.url}`, config.params ?? config.data ?? '');
    return config;
  });
  // 上游 unwrap 拦截器已经把 response 替换成 data 了，这里只能安全地透传
  request.interceptors.response.use(
    (resp) => {
      console.debug('[API ←]', resp);
      return resp;
    },
    (err) => {
      console.warn(`[API ✗] ${err.config?.method?.toUpperCase()} ${err.config?.url}`, err.response?.data ?? err.message);
      return Promise.reject(err);
    },
  );
}

export const http = {
  get<T>(url: string, params?: Record<string, unknown> | object, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, { params, ...config });
  },

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config);
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config);
  },

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.patch(url, data, config);
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config);
  },
};

export default request;
