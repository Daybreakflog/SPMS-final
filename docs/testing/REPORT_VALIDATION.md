# 测试报告验证审计 (REPORT_VALIDATION.md)

> **审计日期**: 2026-06-09
> **审计方法**: 逐项对照源码验证 + Swagger 文档交叉校验
> **审计范围**: SPMS_INTEGRATION_TEST_SUMMARY.md 及其引用的 8 份分报告

---

## 一、正确结论 ✅

以下测试报告结论经源码验证，**真实可信**：

### 1.1 响应包装格式不一致 ✅
- **报告声称**: 后端返回扁平数据，不包含 `{code, data, message}` 包装
- **源码证据**: `src/api/adapter.ts:7-13`
  ```typescript
  function isWrappedResponse(data: unknown): data is WrappedResponse {
    return (
      typeof data === 'object' && data !== null &&
      'code' in data && 'data' in data &&
      typeof (data as WrappedResponse).code === 'number'
    );
  }
  ```
- **实际行为**: 后端返回如 `{ items: [...], page, pageSize, total, totalPages }` 或直接返回对象，`isWrappedResponse` 始终返回 `false`，数据透传
- **验证结论**: **正确**。`unwrapResponse` 不做任何解包，数据原样返回

### 1.2 缺失接口确认 ✅
- **报告声称**: `GET /projects/{id}/users` 后端不存在
- **源码证据**: `src/services/project.service.ts:22-23`
  ```typescript
  // ⚠ GET /projects/{id}/users 后端不存在（Swagger 该路径只有 PUT）。
  //   暂时返回空数组，待后端补充 GET 接口后恢复。
  getUsers: (_id: string): Promise<ProjectUser[]> => Promise.resolve([]),
  ```
- **Swagger 验证**: API 文档仅列出 `PUT /projects/{id}/users`（分配项目用户），无 GET 方法
- **验证结论**: **正确**

### 1.3 审计日志历史接口不存在 ✅
- **报告声称**: `GET /system/audit-logs/resource-history` 后端不存在
- **源码证据**: `src/services/audit.service.ts:7-8`
  ```typescript
  // ⚠ GET /system/audit-logs/resource-history 后端不存在，始终返回空数组。
  resourceHistory: (_resourceId: string): Promise<AuditLog[]> => Promise.resolve([]),
  ```
- **Swagger 验证**: `/system/` 下只有 `GET /api/system/audit-logs`（列表），无 `resource-history`
- **验证结论**: **正确**

### 1.4 分页格式一致性 ✅
- **报告声称**: 前后端分页字段完全一致
- **源码证据**: `src/types/index.ts` 中 `PageResult<T>` 定义与后端返回的 `{ items, page, pageSize, total, totalPages }` 完全对应
- **各 service 验证**: 所有 `.get<PageResult<T>>()` 调用均使用此结构
- **验证结论**: **正确**

### 1.5 Dashboard 字段一致性 ✅
- **报告声称**: 前后端 Dashboard 字段 100% 匹配
- **源码证据**: `src/services/dashboard.service.ts` 直接透传 `/dashboard/overview` 响应
- **验证结论**: **正确**

### 1.6 认证流程完整 ✅
- **报告声称**: 登录/刷新/退出/Token 验证全部通过
- **源码证据**: `src/services/auth.service.ts` 实现了 login/refresh/logout 三个方法，`src/api/request.ts:88-133` 实现了完整的 Token 自动刷新和 401 拦截逻辑
- **验证结论**: **正确**

### 1.7 SQL 注入/XSS 防护 ✅
- **报告声称**: 存在前端防护
- **源码证据**: 
  - `src/api/request.ts:72-74` — `sanitizeInput(config.data)` 对 outgoing 数据进行 XSS 清理
  - `src/utils/sanitize.ts` — XSS sanitization 工具函数
- **验证结论**: **正确**。前端有 XSS 清理逻辑

### 1.8 系统设置无后端 ✅
- **报告声称**: `/system/settings` 返回 404
- **Swagger 验证**: API 文档系统模块仅有 `GET /api/system/audit-logs`（1 个接口），**无任何 `/system/settings` 路由**
- **验证结论**: **正确**。但严重程度被低估（见下文 4.2）

---

## 二、存疑结论 ⚠️

以下结论**部分正确但不完整**或**描述不够精确**：

### 2.1 接口总数 "111" ⚠️
- **报告声称**: 接口总数 111
- **实际数据**: Swagger 文档目录列出：
  - 健康检查 1 | 认证 7 | 平台管理 5 | 项目管理 7 | 用户管理 7 | 租户管理 10
  - 房源管理 13 | 入住退租 5 | 合同 12 | 缴费 11 | Excel 1 | 支付 5
  - 文件管理 3 | 报修 11 | 系统 1 | 投诉 7 | 消息与公告 9 | 仪表盘 2 | 报表 5
  - **合计 ≈ 122**
- **差距分析**: API_INVENTORY 可能是基于前端已知接口统计（前端仅使用 48 个 service 方法），而非完整 Swagger 端点
- **评级**: 不影响核心结论，但数据不够精确

### 2.2 "3 个用户" ⚠️
- **报告声称**: 系统中有 3 个用户
- **源码证据**: 报告中提到 `pageSize=2` 时只返回了 2 条（admin + engineer01），total=3
- **问题**: `pageSize=2` 的查询只能辅助确认 total 值，无法确认第三个用户详情
- **评级**: 数据来源可靠（分页 total），但未能获取第三用户信息

### 2.3 RBAC 推测矩阵 ⚠️
- **报告声称**: 基于代码分析推测了完整 RBAC 矩阵
- **源码验证**: 
  - ✅ PLATFORM_ADMIN 权限范围基本正确
  - ✅ COMPANY_ADMIN 权限范围基本正确（除平台管理外）
  - ⚠️ FINANCE/ENGINEER/CUSTOMER_SERVICE/OPERATIONS 的权限仅从菜单 `roles` 字段推测，但实际路由层面**大量页面无 roleLoader**（见第二部分审计）
- **评级**: 矩阵推测在菜单层面正确，但未识别出路由无保护的问题

### 2.4 安全测试 "16 项全通过" ⚠️
- **报告声称**: 16 项安全测试全通过
- **未测试项**: 报告自行列出 9 项未测试（CSRF、Rate Limiting、文件上传安全等）
- **问题**: "全通过"指的是"已执行的 16 项全通过"，但安全测试覆盖率约为 16/25 = 64%
- **评级**: 表述有歧义，应在标题注明"已执行项"

---

## 三、错误结论 ❌

以下结论与源码事实**不符**：

### 3.1 系统设置 "可能部分功能不可用" ❌
- **报告位置**: API_CONSISTENCY_REPORT.md 第 92 行，RBAC_TEST_REPORT.md 第 106 行
- **报告声称**: "系统设置页面可能部分功能不可用" / "系统设置页面可能异常"
- **源码事实**: `src/services/setting.service.ts` **没有发起任何 HTTP 请求**
  ```typescript
  const DEFAULT_SETTING: SystemSetting = {
    basic: { systemName: '智慧物业管理系统' },
    notification: { emailNotify: false, smsNotify: false, pushNotify: true },
    security: { passwordMinLength: 8, passwordExpireDays: 90, maxLoginAttempts: 5, lockDuration: 30, sessionTimeout: 120 },
  };

  export const settingService = {
    get: (): Promise<SystemSetting> => Promise.resolve(DEFAULT_SETTING),       // 无 HTTP 调用
    updateBasic: (_data: BasicSettingDTO): Promise<SystemSetting> => Promise.resolve(DEFAULT_SETTING),  // 无 HTTP 调用
    updateNotification: (_data: NotificationSettingDTO): Promise<SystemSetting> => Promise.resolve(DEFAULT_SETTING),  // 无 HTTP 调用
    updateSecurity: (_data: SecuritySettingDTO): Promise<SystemSetting> => Promise.resolve(DEFAULT_SETTING),  // 无 HTTP 调用
  };
  ```
- **真实情况**: 
  - 系统设置页面是 **100% 假数据**，四个 service 方法全是 `Promise.resolve(DEFAULT_SETTING)`
  - 用户在页面上修改任何设置并点击保存后，**数据不会持久化**，刷新即丢失
  - 页面显示 `message.success('保存成功')` 但实际**什么都没有保存**
  - MSW mock 定义了 `GET /api/system/settings` 等端点，但 service 层完全绕过了 MSW，直接返回硬编码数据
  - Swagger API 文档中**不存在任何 `/system/settings` 相关端点**
- **严重程度**: 🔴 **严重** — 这不是"部分功能不可用"，而是**整个模块是空壳**
- **影响**: 
  1. 系统设置页面所有功能完全不可用
  2. 安全设置（密码最小长度、过期天数、登录尝试次数、锁定时间、会话超时）均为硬编码默认值
  3. 通知设置（邮件/短信/推送）无法变更
  4. 基本设置（系统名称/Logo）无法持久化

### 3.2 公告 DTO 字段差异描述不完整 ❌
- **报告声称**: `type`、`scope`、`projectIds[]` 等字段 "不包含"
- **源码事实**: 前端 types 中定义了完整的 `AnnouncementType` 和 `AnnouncementScope` 枚举
  ```typescript
  // src/types/enums.ts
  export enum AnnouncementType { NOTICE = 'NOTICE', ACTIVITY = 'ACTIVITY', POLICY = 'POLICY' }
  export enum AnnouncementScope { ALL = 'ALL', PROJECT = 'PROJECT' }
  ```
  但 Swagger API 文档的 `CreateAnnouncementDto` 仅包含 `projectId`（单数）、`title`、`content`、`status`、`publish` 字段
- **问题**: 前端定义了枚举但后端不支持，属于**过度设计**而非"已正确适配"
- **评级**: 低危

---

## 四、被报告遗漏的高风险问题 🔴

以下问题在测试报告中**未被发现或严重性被低估**：

### 4.1 大量路由缺少前端权限守卫（严重）
- **证据**: `src/router/index.tsx` 中 31 条子路由，仅 **14 条** 配置了 `roleLoader`
- **无保护路由** (17 条):
  ```
  /dashboard, /profile
  /customers/renters, /customers/renters/:id
  /properties/tree, /properties/leases, /properties/leases/:id
  /contracts, /contracts/:id
  /billing/fee-items, /billing/bills, /billing/bills/:id, /billing/meter-readings
  /service/repairs, /service/repairs/:id, /service/complaints, /service/complaints/:id
  /notice/announcements, /notice/notifications
  ```
- **风险**: 任何已登录用户（包括 TENANT 角色）可通过直接输入 URL 访问这些页面
- **评估**: 如果后端也未对这些接口做角色校验，则存在**越权风险**
- **详情**: 见 RBAC_AUDIT.md

### 4.2 系统设置模块是完整空壳（严重）
- 详见上文 3.1
- **测试报告遗漏**: 报告仅提到 "404"，未发现 service 层是完全硬编码 stub

### 4.3 MSW mock 与 Swagger 不一致（中危）
- **证据**: `src/mocks/handlers/setting.ts` 定义了 4 个 system/settings 端点，但这些端点在 Swagger 文档中**不存在**
- **证据**: `src/mocks/handlers/notification.ts` 中有 `notificationCenterHandlers` 包含 stats、preferences 等端点
- **风险**: 开发环境（MSW 启用）和生成环境行为不一致，开发者可能在 MSW 下测试通过的功能在生产环境完全不可用

### 4.4 多个 e2e 测试针对不存在功能（中危）
- **证据**: `e2e/system-settings.spec.ts`、`e2e/fee-analysis-permissions.spec.ts`、`e2e/notification-preference.spec.ts`、`e2e/system-billing-rules.spec.ts`、`e2e/report-subscription.spec.ts`
- **这些功能状态**:
  - 费项分析页面：前端代码中不存在对应页面
  - 通知偏好：notification service 注释说明"stats、偏好设置等接口后端不存在，已移除"
  - 系统计费规则页面：不存在对应页面
  - 报表订阅：不存在对应页面
- **风险**: e2e 测试依赖 MSW mock 通过，掩盖了功能实际缺失的事实

### 4.5 前端角色定义 8 个，但仅 1 个可用账号（严重）
- 报告已识别此问题，但严重性被归类为"高"而非"阻断"
- **实际情况**: ENGINEER、TENANT 角色在枚举中定义，但整个前端**没有任何地方访问租户端页面**（`/auth/tenant/login` 路由不存在）
- 这意味着 8 个角色中有 3-4 个**从未被实际测试过**

### 4.6 CUSTOMER_SERVICE 角色可删除合同（中危）
- **证据**: `src/constants/status.ts:107`
  ```typescript
  delete: ['CUSTOMER_SERVICE', 'PLATFORM_ADMIN', 'COMPANY_ADMIN'] as RoleCode[],
  ```
- **风险**: CUSTOMER_SERVICE 通常是客服角色，不应有删除合同的权限

### 4.7 用户列表页无角色限制但页面内创建按钮受限（不一致）
- **证据**: `/org/users` 路由允许 `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN`，但页面内创建/删除按钮仅对 `PLATFORM_ADMIN, COMPANY_ADMIN` 可见
- **风险**: PROJECT_ADMIN 可以访问页面看到用户列表但无法管理，用户体验不一致

---

## 五、报告质量评估

| 维度 | 评分 | 说明 |
|------|:---:|------|
| 事实准确性 | 🟡 75% | 核心结论大多正确，但系统设置问题严重性被低估 |
| 覆盖完整度 | 🟡 65% | 遗漏了 6 个高中危问题 |
| 风险定级 | 🟡 70% | RBAC 测试不完整被正确识别，但某些问题的严重性评级偏低 |
| 源码引证 | 🔴 50% | 大量结论基于 HTTP 测试而非源码分析，未发现 service 层 stub |
| 可操作性 | 🟢 80% | 建议修复项明确且有优先级 |

**综合**: 报告作为 HTTP 层面测试是合格的，但未进行源码层面审计，遗漏了多个关键问题。

---

## 六、对最终报告的建议修正

1. **系统设置模块**: 从 "中危/M-02" 提升为 "严重/C-01"，描述为"系统设置模块是完整空壳，所有数据为硬编码，无法持久化"
2. **路由权限**: 新增 "严重/C-02"，17 条路由缺少前端 roleLoader
3. **MSW 不一致**: 新增 "中危/M-04"，MSW mock 端点与 Swagger 不一致
4. **e2e 测试**: 新增 "低危/L-05"，多个 e2e 测试针对不存在功能
5. **接口总数**: 修正为 "122"（Swagger 精确计数）或注明为"前端使用接口约 48 个"
