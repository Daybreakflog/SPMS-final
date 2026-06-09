/**
 * 会话相关常量集中管理。
 *
 * 当前后端 `/api/system/settings` 尚未实现，因此 sessionTimeout 仅来自前端常量。
 * TODO(backend): 待后端补齐系统设置接口后，应在登录后读取
 *   `SystemSetting.security.sessionTimeout`（分钟）并覆盖此默认值。
 */

const ENV_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);

/** 默认空闲超时阈值（毫秒），用于无操作自动登出。 */
export const DEFAULT_SESSION_TIMEOUT_MS =
  Number.isFinite(ENV_TIMEOUT_MINUTES) && ENV_TIMEOUT_MINUTES > 0
    ? ENV_TIMEOUT_MINUTES * 60 * 1000
    : 30 * 60 * 1000;

/** 空闲检测轮询间隔（毫秒） */
export const SESSION_TIMEOUT_CHECK_INTERVAL_MS = 60 * 1000;
