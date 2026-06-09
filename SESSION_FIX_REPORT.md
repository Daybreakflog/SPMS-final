# SESSION_FIX_REPORT — 会话超时常量化报告

## 背景

审计项 **C-04**：`src/api/request.ts` 中硬编码 `const SESSION_TIMEOUT = 30 * 60 * 1000;`，
无法被系统设置驱动，也无法在不同部署环境中覆盖。

## 修改文件

### 新增：`src/constants/session.ts`

```ts
const ENV_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);

export const DEFAULT_SESSION_TIMEOUT_MS =
  Number.isFinite(ENV_TIMEOUT_MINUTES) && ENV_TIMEOUT_MINUTES > 0
    ? ENV_TIMEOUT_MINUTES * 60 * 1000
    : 30 * 60 * 1000;

export const SESSION_TIMEOUT_CHECK_INTERVAL_MS = 60 * 1000;
```

- 默认值仍为 30 分钟，保持现有行为。
- 通过环境变量 `VITE_SESSION_TIMEOUT_MINUTES` 可在不同环境覆盖。
- TODO 注释明确：后端 `/api/system/settings` 就绪后，应从 `security.sessionTimeout` 注入。

### 修改：`src/api/request.ts`

- 删除 `const SESSION_TIMEOUT = 30 * 60 * 1000;`。
- 引入 `DEFAULT_SESSION_TIMEOUT_MS` 与 `SESSION_TIMEOUT_CHECK_INTERVAL_MS`。
- 新增 `let sessionTimeoutMs = DEFAULT_SESSION_TIMEOUT_MS;` 作为运行时可覆盖值。
- 新增 `export function setSessionTimeoutMs(ms: number)`：后端接口就绪后登录回调里调用即可热更新。
- `setInterval` 间隔改用 `SESSION_TIMEOUT_CHECK_INTERVAL_MS`。

## 调用链示例（后端就绪后）

```ts
// 在 user.store.ts 或 login 成功回调中：
import { setSessionTimeoutMs } from '@/api/request';

const setting = await settingService.get();
setSessionTimeoutMs(setting.security.sessionTimeout * 60_000);
```

## 风险说明

- 当前仍是前端常量驱动；恶意用户可通过修改本地时间或频繁触发活动事件绕过空闲检测。
- 真正的会话过期必须依赖后端 JWT 的 `exp` 与 refresh-token 旋转策略（已有）。本机制只是 UX 层兜底。
- 若后端实际下发的超时单位不是"分钟"，需要在 `setSessionTimeoutMs` 调用处做单位换算。
