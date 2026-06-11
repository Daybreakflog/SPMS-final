# RBAC 测试报告 (RBAC_TEST_REPORT.md)

> 测试时间: 2026-06-09
> 测试账号: admin (PLATFORM_ADMIN + COMPANY_ADMIN)

## 重要前提

⚠️ **当前仅有一个可测试账号 (admin)**，因此无法完整覆盖所有角色的 RBAC 矩阵。
以下测试基于 admin (PLATFORM_ADMIN + COMPANY_ADMIN) 角色执行。

engineer01 账号存在于系统中但密码未知，无法测试 ENGINEER 角色的权限限制。

## RBAC 测试结果 (admin: PLATFORM_ADMIN + COMPANY_ADMIN)

| 接口路径 | 页面/功能 | 预期 | 实际 | 结果 |
|----------|-----------|------|------|------|
| `/platform/companies` | 公司管理 | 200 | 200 | ✅ PASS |
| `/platform/companies/:id` | 公司详情 | 200 | 200 | ✅ PASS |
| `/system/audit-logs` | 审计日志 | 200 | 200 | ✅ PASS |
| `/users` | 用户管理 | 200 | 200 | ✅ PASS |
| `/projects` | 项目管理 | 200 | 200 | ✅ PASS |
| `/dashboard/overview` | 仪表盘 | 200 | 200 | ✅ PASS |
| `/billing/bills` | 账单管理 | 200 | 200 | ✅ PASS |
| `/payments/orders` | 支付管理 | 200 | 200 | ✅ PASS |
| `/contracts` | 合同管理 | 200 | 200 | ✅ PASS |
| `/complaints` | 投诉管理 | 200 | 200 | ✅ PASS |
| `/repairs` | 报修管理 | 200 | 200 | ✅ PASS |
| `/announcements` | 公告管理 | 200 | 200 | ✅ PASS |
| `/renters` | 租户管理 | 200 | 200 | ✅ PASS |
| `/leases` | 入住退租 | 200 | 200 | ✅ PASS |
| `/reports/financial/rent-income` | 财务报表 | 200 | 200 | ✅ PASS |
| `/reports/operational/repair-analysis` | 运营报表 | 200 | 200 | ✅ PASS |
| `/billing/fee-items` | 费用项管理 | 200 | 200 | ✅ PASS |
| `/properties/projects/:id/tree` | 房源树 | 200 | 200 | ✅ PASS |
| `/system/settings` | 系统设置 | 200 | ⚠️ 404 | ⚠️ 路由不存在 |

---

## 未认证访问测试 (无 Token)

| 接口 | 预期 | 实际 | 结果 |
|------|------|------|------|
| `/users` | 401 | 401 | ✅ PASS |
| `/platform/companies` | 401 | 401 | ✅ PASS |
| `/system/audit-logs` | 401 | 401 | ✅ PASS |
| `/billing/bills` | 401 | 401 | ✅ PASS |

---

## 前端 RBAC 实现分析

### 角色定义 (`src/types/enums.ts`)

```typescript
enum RoleCode {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  FINANCE = 'FINANCE',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  ENGINEER = 'ENGINEER',
  OPERATIONS = 'OPERATIONS',
  TENANT = 'TENANT',
}
```

### 前端路由守卫 (`src/router/guards.ts`)

- `authLoader()`: 检查 Token 和用户信息，无则跳转登录页
- `guestLoader()`: 已登录则跳转 dashboard
- `roleLoader(requiredRoles)`: 检查用户角色是否包含必需角色，无权限跳转 /403

### 权限机制

前端通过路由级别的 `roleLoader` 进行页面级权限控制。
接口级权限依赖后端 JWT 中的 roles 进行服务端校验。

---

## 矩阵 (基于代码分析推测，非全真实测试)

| 功能 | PLATFORM_ADMIN | COMPANY_ADMIN | FINANCE | ENGINEER | CUSTOMER_SERVICE | OPERATIONS | TENANT |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 公司管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 用户管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 项目管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 财务报表 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 合同管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 账单管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 支付管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 报修管理 | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| 投诉管理 | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| 公告管理 | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| 租户管理 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 房源管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 仪表盘 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 审计日志 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 系统设置 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 发现的问题

### 🔴 1. 无法完整测试 RBAC (严重)

**问题**: 仅有 admin 一个可用账号，无法验证其他角色的权限边界
**建议**: 创建各角色测试账号，或提供 seed 脚本初始化测试数据

### ⚠️ 2. `/system/settings` 路由返回 404

**问题**: 前端有系统设置页面 (`src/pages/system/settings/index.tsx`)，但后端 `/system/settings` 返回 404
**分析**: 后端 API 文档中不存在此端点，前端可能需要使用其他接口
**影响**: 系统设置页面可能部分功能不可用

### ⚠️ 3. 前端对接 Swagger 已知缺失

`src/services/project.service.ts` 和 `src/services/audit.service.ts` 中有注释标记：
- `GET /projects/{id}/users` 后端不存在
- `GET /system/audit-logs/resource-history` 后端不存在
