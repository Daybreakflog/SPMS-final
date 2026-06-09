# NEW_CRITICAL_ISSUES — 修复过程中新发现的高风险问题

下列问题不在原审计清单 (C-01~C-04 / H-01~H-03) 之内，但在修复过程中暴露出来，建议尽快立项。

---

## N-01 [HIGH] TENANT 角色可登录后台 staff 应用

**现象**：`RoleCode` 枚举里包含 `TENANT`，并且 `authLoader` 仅检查"是否登录"，不限制 `userType`。
理论上，租户携带 staff 端 token（或被横向越权）能进入 `/dashboard`，从那里再尝试访问任何未严格 guard 的路由。

**佐证**：
- `src/router/guards.ts:authLoader` 仅判断 `user` 是否存在。
- `src/types/enums.ts` 同时定义了 `UserType.STAFF` 与 `UserType.TENANT`，但前端没有任何一处在路由层检查 `userType`。

**建议**：
- `authLoader` 增加 `user.userType === UserType.STAFF` 校验，否则跳转 `/auth/staff/login` 并清 token。
- 后端登录接口（`/api/auth/staff/login`）若收到 TENANT 用户必须直接 401，避免前端兜底失败。

---

## N-02 [HIGH] DEFAULT_SETTING.sessionTimeout 与 request.ts 单位 / 数值不一致

**现象**：
- 原 `setting.service.ts.DEFAULT_SETTING.security.sessionTimeout = 120`（单位：**分钟**）
- 原 `request.ts.SESSION_TIMEOUT = 30 * 60 * 1000`（单位：**毫秒，30 分钟**）
- 二者既不同步也不同单位；本次抽出 `DEFAULT_SESSION_TIMEOUT_MS = 30 分钟` 后，已与 `MSW state.security.sessionTimeout = 30`（分钟）对齐。

**风险**：
- 后端如果直接把 `security.sessionTimeout` 当秒 / 毫秒 / 分钟之一传给前端，三方实现各有解读。
- 必须**在 API 文档里明确 sessionTimeout 单位**。建议统一为"分钟"，避免再翻车。

---

## N-03 [MEDIUM] notification handler 同时暴露 PATCH 与 PUT 两套语义重复端点

**现象**：MSW 中同时存在：
- `PATCH /api/notifications/:id/read`（与 Swagger 一致）
- `PUT   /api/notification/:id/read`（路径单数，Swagger 没有）

两套对应不同的前端调用点，存在事实上的"双写"风险。后端任一侧实现差异都会出现一边读到、一边读不到。

**建议**：
- 立项把所有 `/notification/*`（单数）调用统一改用 `/notifications/*` PATCH 系列。
- MSW 中删除 `PUT /api/notification/...` 重复 handler（已在 `MSW_CLEANUP_REPORT.md` 标记）。

---

## N-04 [MEDIUM] 401 → refresh 链路没有限制重入

**现象**：`request.ts` 中 401 拦截器把请求 push 到 `pendingQueue`；若刷新接口在等待期间被多个请求触发，且 refresh 本身又返回 401（例如被撤销），第二次进入会因 `refreshing` 还未置空而拿到旧 promise，但 `pendingQueue` 已被清空一次。极端情况下出现"队列里有请求永远不被 resolve"的悬挂。

**建议**：
- 在 `.catch` 内额外 `reject` 队列中所有等待请求，避免悬挂。
- 给 refresh 加 timeout（5s），失败直接清队列 + reject + 强制登出。

---

## N-05 [LOW] `clearTokens()` 后 `window.location.href = '/auth/staff/login'` 无法被 e2e 拦截

**现象**：多处直接用 `window.location.href` 触发跳转，绕过 `react-router`。`playwright` 用例对该跳转的断言只能依赖 URL 变化，不能拦截到 React 路由事件，给 e2e 设计带来困扰。

**建议**：
- 提取 `redirectToLogin()` 工具函数；DEV / TEST 环境下可注入桩；生产仍用 `window.location.href` 保证强制刷新。

---

以上 N-01 ~ N-05 不影响本次主修复合入，但建议作为 Sprint 22 的明确目标。
