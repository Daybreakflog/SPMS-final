# RBAC 权限审计报告 (RBAC_AUDIT.md)

> **审计日期**: 2026-06-09
> **审计范围**: 前端路由 + 菜单 + 页面内权限组件 + 服务层
> **审计方法**: 全源码静态分析，逐文件扫描 roleLoader / PermissionGuard / useHasRole

---

## 一、角色定义

**来源**: `src/types/enums.ts:1-9`

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

系统定义 8 个角色，但 **ENGINEER 和 TENANT 在前端路由中完全没有被使用**。

---

## 二、菜单级权限 (Sidebar 过滤)

**来源**: `src/router/routes.config.ts` → `src/layouts/Sidebar.tsx:16-28`

`filterByRole()` 函数过滤有 `roles` 字段的菜单项。无 `roles` 字段的菜单对所有登录用户可见。

| 一级菜单 | 子菜单 | 菜单 roles | 可见角色 |
|----------|--------|-----------|----------|
| 仪表盘 | - | 无限制 | **全部** |
| **平台管理** | 物业公司 | `PLATFORM_ADMIN` | PLATFORM_ADMIN |
| 组织管理 | 项目管理 | `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN |
| 组织管理 | 员工管理 | (继承父级) | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN |
| 客户管理 | 租户档案 | 无限制 | **全部** |
| 房源管理 | 房源树 | 无限制 | **全部** |
| 房源管理 | 入住记录 | 无限制 | **全部** |
| 合同管理 | 全部合同 | 无限制 | **全部** |
| 收费管理 | 费项管理 | 无限制 | **全部** |
| 收费管理 | 账单中心 | 无限制 | **全部** |
| 收费管理 | 抄表导入 | 无限制 | **全部** |
| 收费管理 | **支付订单** | `FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN` | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN |
| 服务工单 | 报修工单 | 无限制 | **全部** |
| 服务工单 | 投诉受理 | 无限制 | **全部** |
| 公告通知 | 公告管理 | 无限制 | **全部** |
| 公告通知 | 我的消息 | 无限制 | **全部** |
| **数据报表** | 全部子项 | `FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS` | 5角色 |
| **系统管理** | 审计日志 | `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS` | 4角色 |
| **系统管理** | 系统设置 | `PLATFORM_ADMIN` | PLATFORM_ADMIN |

**菜单权限统计**: 20 个叶子菜单项中，**11 个无角色限制**（55%）。

---

## 三、路由级权限 (roleLoader)

**来源**: `src/router/index.tsx` → `src/router/guards.ts:20-32`

`roleLoader` 在路由匹配时执行，若用户无权限则重定向到 `/403`。

### 有 roleLoader 的路由

| 路由路径 | 允许角色 | 来源 |
|----------|----------|------|
| `/platform/companies` | PLATFORM_ADMIN | `index.tsx:46` |
| `/platform/companies/:id` | PLATFORM_ADMIN | `index.tsx:52` |
| `/org/projects` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | `index.tsx:59` |
| `/org/projects/:id` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | `index.tsx:65` |
| `/org/users` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | `index.tsx:72` |
| `/org/users/:id` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | `index.tsx:78` |
| `/billing/payments` | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN | `index.tsx:141` |
| `/reports/rent-income` | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN | `index.tsx:172` |
| `/reports/collection-rate` | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN | `index.tsx:178` |
| `/reports/overdue` | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN | `index.tsx:184` |
| `/reports/repair-analysis` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS | `index.tsx:190` |
| `/reports/satisfaction` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS | `index.tsx:196` |
| `/system/audit-logs` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS | `index.tsx:203` |
| `/system/settings` | PLATFORM_ADMIN | `index.tsx:209` |

### 🚨 无 roleLoader 的路由（仅 authLoader，任何登录用户可访问）

| 路由路径 | 风险等级 | 说明 |
|----------|:---:|------|
| `/dashboard` | 🟢 低 | 仪表盘对所有角色开放合理 |
| `/profile` | 🟢 低 | 个人中心开放合理 |
| `/customers/renters` | 🟡 中 | 租户档案应有角色限制 |
| `/customers/renters/:id` | 🟡 中 | 同上 |
| `/properties/tree` | 🟡 中 | 房源树应限制可操作角色 |
| `/properties/leases` | 🟡 中 | 入住记录应有角色限制 |
| `/properties/leases/:id` | 🟡 中 | 同上 |
| `/contracts` | 🔴 高 | 合同管理无限制，CUSTOMER_SERVICE 可删合同 |
| `/contracts/:id` | 🔴 高 | 同上 |
| `/billing/fee-items` | 🔴 高 | 费项管理无限制 |
| `/billing/bills` | 🔴 高 | 账单中心无限制 |
| `/billing/bills/:id` | 🔴 高 | 同上 |
| `/billing/meter-readings` | 🔴 高 | 抄表导入无限制 |
| `/service/repairs` | 🟡 中 | 报修工单无限制 |
| `/service/repairs/:id` | 🟡 中 | 同上 |
| `/service/complaints` | 🟡 中 | 投诉受理无限制 |
| `/service/complaints/:id` | 🟡 中 | 同上 |
| `/notice/announcements` | 🟡 中 | 公告管理无限制 |
| `/notice/notifications` | 🟢 低 | 个人消息合理 |

**统计**: 31 个路由中，**17 个无 roleLoader**（55%）。

---

## 四、页面内组件级权限 (PermissionGuard)

**来源**: `src/components/PermissionGuard/index.tsx`

`PermissionGuard` 在组件渲染层面检查权限，无权限时隐藏或禁用子组件。

### 各页面 PermissionGuard 使用情况

| 页面 | 文件 | PermissionGuard 检查的操作 | 限制角色 |
|------|------|---------------------------|----------|
| 平台公司列表 | `platform/companies/index.tsx` | 新增、删除按钮 | PLATFORM_ADMIN |
| 项目列表 | `org/projects/index.tsx` | 新增、删除按钮 | PLATFORM_ADMIN, COMPANY_ADMIN |
| 项目详情 | `org/projects/detail.tsx` | 编辑按钮 | PLATFORM_ADMIN, COMPANY_ADMIN |
| 员工列表 | `org/users/index.tsx` | 新增、删除按钮 | PLATFORM_ADMIN, COMPANY_ADMIN |
| 合同列表 | `contracts/index.tsx` | 新建按钮 | PLATFORM_ADMIN, COMPANY_ADMIN, FINANCE, PROJECT_ADMIN |
| 合同列表 | `contracts/index.tsx` | 删除按钮 | PLATFORM_ADMIN, COMPANY_ADMIN |
| 合同列表 | `contracts/index.tsx` | 操作按钮(含delete) | CUSTOMER_SERVICE, PLATFORM_ADMIN, COMPANY_ADMIN |
| 费项管理 | `billing/fee-items/index.tsx` | 新建、删除按钮 | FINANCE, PLATFORM_ADMIN |
| 账单中心 | `billing/bills/index.tsx` | 手动创建按钮 | FINANCE, PLATFORM_ADMIN |
| 账单中心 | `billing/bills/index.tsx` | 批量操作按钮 | FINANCE, PLATFORM_ADMIN |
| 账单详情 | `billing/bills/detail.tsx` | 支付确认按钮 | FINANCE, PLATFORM_ADMIN |
| 抄表导入 | `billing/meter-readings/index.tsx` | 导入按钮 | FINANCE, OPERATIONS, PLATFORM_ADMIN |
| 支付订单 | `billing/payments/index.tsx` | 整页保护 | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN |
| 租户列表 | `customers/renters/index.tsx` | 新建、删除按钮 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE |
| 租户详情 | `customers/renters/detail.tsx` | 编辑按钮 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE |
| 房源树 | `properties/tree/index.tsx` | 新建、编辑、删除、解绑按钮 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE |
| 入住记录 | `properties/leases/index.tsx` | 入住、退租按钮 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE |
| 报修列表 | `service/repairs/index.tsx` | 派单按钮 | PLATFORM_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE |
| 投诉列表 | `service/complaints/index.tsx` | 整页保护 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE, OPERATIONS |
| 公告管理 | `notice/announcements/index.tsx` | 管理操作 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS |
| 报表页面 | `reports/components/ReportTemplate.tsx` | 导出按钮 | FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS |
| 审计日志 | `system/audit-logs/index.tsx` | 整页保护 | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS |
| 系统设置 | `system/settings/index.tsx` | 整页保护 | PLATFORM_ADMIN |

---

## 五、引擎级权限 (后端依赖)

**结论**: 前端无法审计后端权限。以下为风险分析：

| 层级 | 保护方式 | 可绕过? |
|------|----------|:---:|
| 菜单隐藏 | `filterByRole()` | ✅ 可直接 URL 访问 |
| 路由守卫 | `roleLoader()` | ✅ 仅 14/31 路由有 |
| 页面内组件 | `PermissionGuard()` | ✅ 仅隐藏 UI，不阻止 API 调用 |
| **API 请求** | **后端 JWT roles 校验** | ❓ **未知 (前端无法审计)** |

---

## 六、角色权限矩阵（实际代码 vs 测试报告推测）

| 功能 | 测试报告推测 | 代码实际 | 一致性 |
|------|:---:|:---:|:---:|
| 公司管理 | PLATFORM_ADMIN | PLATFORM_ADMIN | ✅ |
| 用户管理(员工) | PLATFORM_ADMIN, COMPANY_ADMIN | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | ⚠️ 报告遗漏 PROJECT_ADMIN |
| 项目管理 | PLATFORM_ADMIN, COMPANY_ADMIN | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | ⚠️ 报告遗漏 PROJECT_ADMIN |
| 财务报表 | +FINANCE | +FINANCE | ✅ |
| 合同管理(菜单) | 全部 | **全部 (无限制)** | ❌ 报告说有限制 |
| 合同管理(操作) | 部分角色 | CUSTOMER_SERVICE 可删合同 | ❌ 报告未发现 |
| 账单管理(菜单) | 全部 | **全部 (无限制)** | ❌ 报告说有限制 |
| 支付管理 | +FINANCE | +FINANCE (路由+菜单都有) | ✅ |
| 报修管理 | 全部 | **全部 (无限制)** | ⚠️ 报告说多角色可用 |
| 投诉管理 | 全部 | 5角色 (有 PermissionGuard) | ⚠️ |
| 公告管理 | 全部 | 4角色 (MANAGE_ROLES) | ⚠️ |
| 租户管理 | CUSTOMER_SERVICE | 4角色 | ⚠️ |
| 房源管理 | OPERATIONS | 4角色 (含 CUSTOMER_SERVICE) | ⚠️ |
| 仪表盘 | 全部 | 全部 | ✅ |
| 审计日志 | PLATFORM_ADMIN | 4角色 | ⚠️ 报告遗漏 3 个角色 |
| 系统设置 | PLATFORM_ADMIN | PLATFORM_ADMIN | ✅ |

**关键差异**: 测试报告高估了 RBAC 的覆盖度。许多角色在菜单/路由层面根本没有限制。

---

## 七、风险汇总

### 🔴 高风险 (5 项)

| ID | 问题 | 证据 | 影响 |
|----|------|------|------|
| RBAC-01 | **17/31 路由无 roleLoader** | `src/router/index.tsx` 中仅 14 条路由有 `loader: roleLoader(...)` | 任意登录用户可通过直接 URL 访问敏感页面 |
| RBAC-02 | **合同删除权限授予 CUSTOMER_SERVICE** | `src/constants/status.ts:106` - `delete: ['CUSTOMER_SERVICE', ...]` | 客服角色可删除合同 |
| RBAC-03 | **收费管理子页面全部无路由保护** | `/billing/fee-items`, `/billing/bills`, `/billing/meter-readings` 均无 roleLoader | 任意登录用户可操作收费核心数据 |
| RBAC-04 | **ENGINEER/TENANT 角色前端零使用** | 全部 31 条路由无一条使用 ENGINEER 或 TENANT | 这两个角色的前端权限完全未定义 |
| RBAC-05 | **仅隐藏 UI 不阻止 API** | PermissionGuard 只在渲染层隐藏按钮，不拦截底层 service 调用 | 若有人绕过 UI 直接调用 service，无任何前端防护 |

### 🟡 中风险 (4 项)

| ID | 问题 | 证据 |
|----|------|------|
| RBAC-06 | 权限矩阵与测试报告不一致 | 报告矩阵推测在前，但多处与实际代码不符 |
| RBAC-07 | 菜单 roles 与路由 roleLoader 不一致 | 菜单 `routes.config.ts` 定义 roles 但路由 `index.tsx` 独立定义 |
| RBAC-08 | PermissionGuard 的 `disableOnly` 模式从未使用 | 搜索全项目，仅 2 处调用且均未传 `disableOnly` |
| RBAC-09 | 无角色变更后的权限刷新机制 | `useUserStore` 中 roles 从 localStorage 读取，角色变更后需重新登录 |

### 🟢 低风险 (2 项)

| ID | 问题 | 证据 |
|----|------|------|
| RBAC-10 | 缺失角色常量导出 | `RoleCode` 有 8 个值但实际使用的仅 6 个 |
| RBAC-11 | 403 页面信息不足 | `Forbidden.tsx` 仅显示静态文本，未告知用户缺少哪个角色 |

---

## 八、修复建议

### 立即修复 (上线前必须)

1. **为所有敏感路由添加 roleLoader**
   - `/contracts` → PLATFORM_ADMIN, COMPANY_ADMIN, FINANCE, PROJECT_ADMIN
   - `/billing/fee-items` → FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN
   - `/billing/bills` → FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN
   - `/billing/meter-readings` → FINANCE, OPERATIONS, PLATFORM_ADMIN
   - `/service/repairs` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE, ENGINEER, OPERATIONS
   - `/service/complaints` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE, OPERATIONS
   - `/properties/tree` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS
   - `/properties/leases` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE
   - `/customers/renters` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE
   - `/notice/announcements` → PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS

2. **审查 CUSTOMER_SERVICE 的合同删除权限**
   - `src/constants/status.ts:106` 移除 `CUSTOMER_SERVICE` 或降级为仅查看

3. **确认 ENGINEER 和 TENANT 角色的前端权限范围**
   - 补充这两个角色对应的路由和菜单权限

### 近期修复

4. 统一菜单 roles 和路由 roleLoader 的定义（单一数据源）
5. 增加角色变更后的实时权限刷新（非 localStorage 依赖）
6. 后端 RBAC 审计（需后端配合）
