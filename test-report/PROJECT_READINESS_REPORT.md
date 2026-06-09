# 上线准备度评估报告 (PROJECT_READINESS_REPORT.md)

> **评估日期**: 2026-06-09
> **评估方法**: 多维度综合评分（架构/代码/安全/权限/测试/可维护性）
> **基础数据**: 61 个源码文件 + 122 Swagger 端点 + 23 e2e 用例

---

## 综合评分

| 维度 | 评分 | 权重 | 加权 | 说明 |
|------|:---:|:---:|:---:|------|
| 架构质量 | 75 | 20% | 15.0 | 分层清晰，但 services 层有 stub 污染 |
| 代码质量 | 70 | 15% | 10.5 | TypeScript 规范，但有 mock 数据混入生产代码 |
| 类型安全 | 80 | 10% | 8.0 | 枚举定义完整，DTO 类型齐全 |
| API 一致性 | 55 | 15% | 8.3 | 响应格式不匹配，多个 stub 替代真 API |
| 权限安全 | 40 | 20% | 8.0 | 17/31 路由无保护，仅菜单隐藏 |
| 可维护性 | 65 | 10% | 6.5 | 结构清晰，但 stub 代码增加理解成本 |
| 测试覆盖率 | 50 | 5% | 2.5 | e2e 覆盖但依赖 MSW，无单元测试 |
| 上线风险 | 45 | 5% | 2.3 | 多角色未验证，系统设置有 facade |
| **总计** | | **100%** | **61.1** | |

> **总体评分: 61 / 100**

---

## 上线建议

> ❌ **不建议直接上线**

核心问题: 权限安全(40 分)和 API 一致性(55 分)严重拖分。

---

## 维度详细评估

### 1. 架构质量 (75/100)

**优点**:
- 清晰的分层: pages → services → api/request → backend
- 统一的状态管理(zustand)和路由(react-router v6)
- 良好的关注点分离: layouts / router / store / services 各司其职

**问题**:
- `setting.service.ts` 在 services 层内写了硬编码 stub，破坏了分层纯净性
- `project.service.ts` 和 `audit.service.ts` 有注释掉的真实调用痕迹
- MSW handlers 定义了不存在的端点（`/system/settings/*`），误导开发者

**证据**:
- `src/services/setting.service.ts` - 全部 `Promise.resolve(DEFAULT_SETTING)`
- `src/services/project.service.ts:20` - `Promise.resolve([])`
- `src/mocks/handlers/setting.ts` - 定义了 4 个后端不存在的端点

### 2. 代码质量 (70/100)

**优点**:
- TypeScript 严格模式，有明确的类型定义
- 统一的 ESLint 配置
- 良好的注释习惯（标注 stub 原因）

**问题**:
- `setting.service.ts` 硬编码数据混入 services 层
- `request.ts` 中 `sanitizeInput` 对所有 POST/PATCH 数据执行 XSS 清理，可能影响正常数据
- 没有统一的环境变量类型定义

### 3. 类型安全 (80/100)

**优点**:
- `src/types/enums.ts` 定义完整，覆盖所有业务枚举
- DTO 类型与实际 API 参数匹配度高
- `normalizeRoles()` / `normalizeProjectIds()` 处理类型不确定性

### 4. API 一致性 (55/100)

| 检查项 | 状态 | 详情 |
|--------|:---:|------|
| 响应格式一致 | ❌ | 前端期望 `{code,data,message}`，后端返回扁平数据 |
| 分页格式一致 | ✅ | `{items,page,pageSize,total,totalPages}` |
| 字段名一致 | ✅ | camelCase 完全匹配 |
| Stub 替代真 API | ❌ | 3 个 service 方法返回 stub 数据 |
| MSW 端点与 Swagger 一致 | ❌ | `/system/settings/*` 仅 MSW 有 |
| 文件: `src/api/adapter.ts:9-18` | | `isWrappedResponse` 检查 `code`+`data`+`message` |

### 5. 权限安全 (40/100) — 严重

| 风险点 | 详情 |
|--------|------|
| 路由无保护 | 17/31 路由无 `roleLoader` |
| 仅菜单隐藏 | 引擎工程师可直接访问 `/billing/fee-items` 等页面 |
| 服务层无检查 | 所有 API 调用不含前端角色校验 |
| 越权风险 | CUSTOMER_SERVICE 可删除合同（需后端配合阻止） |

**证据**:
- `src/router/index.tsx` - 仅 11 个路由有 `roleLoader`
- `src/layouts/Sidebar.tsx:14-22` - `filterByRole()` 只控制菜单可见性

### 6. 可维护性 (65/100)

**优点**: 模块化程度高，注释清晰
**问题**: stub 代码增加理解成本；MSW 端点与实际后端不一致

### 7. 测试覆盖率 (50/100)

| 测试类型 | 数量 | 依赖 | 可靠性 |
|----------|:---:|------|:---:|
| e2e (Playwright) | 23 | MSW mock | 低（依赖不存在的端点） |
| 单元测试 | 少量 | Vitest | 低 |
| 集成测试 | 0 | - | 无 |

**问题**: e2e 中的 `system-settings.spec.ts` 等用例依赖 MSW mock，生产环境无法执行

### 8. 上线风险 (45/100)

具体风险见下方 Top 10 问题清单。

---

## Top 10 必须修复问题（阻断上线）

| # | 严重度 | 问题 | 文件 |
|---|:---:|------|------|
| 1 | 🔴 阻断 | 系统设置 100% facade，所有保存无实际效果 | `src/services/setting.service.ts` |
| 2 | 🔴 阻断 | 17/31 路由无 `roleLoader`，仅菜单隐藏 | `src/router/index.tsx` |
| 3 | 🔴 阻断 | MSW 定义了后端不存在的 `/system/settings/*` 端点 | `src/mocks/handlers/setting.ts` |
| 4 | 🔴 高 | RBAC 仅有 admin 一个可测试账号 | 数据库/Seed |
| 5 | 🟠 高 | `setting.service.ts` 全部返回 stub 数据 | `src/services/setting.service.ts:10-22` |
| 6 | 🟠 高 | 响应包装格式假设与后端不一致 | `src/api/adapter.ts:9-18` |
| 7 | 🟠 高 | `projectService.getUsers()` 永久返回 `[]` | `src/services/project.service.ts:20` |
| 8 | 🟠 高 | `auditService.resourceHistory()` 永久返回 `[]` | `src/services/audit.service.ts:10` |
| 9 | 🟡 中 | 无 Tenant 登录前端页面 | 前端无 `/auth/tenant/login` 使用 |
| 10 | 🟡 中 | 401 响应 body 可能为空，前端未处理 | `src/api/request.ts:90-92` |

---

## Top 10 推荐优化问题（非阻断）

| # | 问题 | 文件 |
|---|------|------|
| 1 | e2e 用例依赖 MSW mock，应在生产环境禁用 | `e2e/system-settings.spec.ts` 等 |
| 2 | `sanitizeInput` 对正常数据执行 XSS 清理，可能引入性能问题 | `src/utils/sanitize.ts` |
| 3 | CUSTOMER_SERVICE 角色可以删除合同（需评估是否合理） | `src/constants/status.ts:107` |
| 4 | 多语言 key 不完整，部分页面可能显示 key 原文 | `src/locales/` |
| 5 | 未使用的 e2e 用例（fee-analysis, notification-preference 等页面不存在） | `e2e/` |
| 6 | 文件上传缺少类型和大小校验 | `src/api/upload.ts` |
| 7 | Session 超时检测依赖 `setInterval`，精度低 | `src/api/request.ts:25-27` |
| 8 | CSRF token 从 `<meta>` 读取但后端可能不验证 | `src/api/request.ts:48-51` |
| 9 | `useTableQuery` hook 无自动重试机制 | `src/hooks/useTableQuery.ts` |
| 10 | Token 刷新队列在并发请求时可能导致竞态 | `src/api/request.ts:79-103` |

---

## 结论

**当前状态**: 项目基本能运行，但存在 3 个阻断级问题和 7 个高危问题。

**建议**: 专项解决阻断问题后再上线。修复周期预估 2-3 周。

**上线后监控重点**:
1. RBAC 越权日志（关注 FINANCE / ENGINEER 角色访问行为）
2. 系统设置页面 404 / 无效果
3. 401 错误处理是否正常
4. 合同删除操作审计
