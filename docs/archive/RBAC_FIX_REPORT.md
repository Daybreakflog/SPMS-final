# RBAC_FIX_REPORT — 路由权限补齐报告

## 背景

审计项 **C-02**：`src/router/index.tsx` 中 17 个路由没有 `roleLoader`，与 `routes.config.ts` 中菜单角色不一致，存在「菜单隐藏但 URL 可直接访问」的越权漏洞。

## 修改文件

| 文件 | 修改内容 |
|---|---|
| `src/router/index.tsx` | 顶部新增 8 组角色组常量；为 17 个原本"裸路由"添加 `roleLoader`。 |
| `src/router/routes.config.ts` | 与 `index.tsx` 共享同一组角色组常量；为所有菜单（含父级 / 子级）补齐 `roles` 字段，使菜单可见性与路由 guard 严格同源。 |

## 角色组定义（两文件共用）

```
ADMIN_ROLES               = PLATFORM_ADMIN / COMPANY_ADMIN / PROJECT_ADMIN
CUSTOMER_OPERATION_ROLES  = ADMIN + CUSTOMER_SERVICE
PROPERTY_TREE_ROLES       = ADMIN + OPERATIONS
FINANCE_ROLES             = FINANCE + PLATFORM_ADMIN + COMPANY_ADMIN
BILLING_VIEW_ROLES        = ADMIN + FINANCE
METER_ROLES               = ADMIN + FINANCE + OPERATIONS
REPAIR_ROLES              = ADMIN + CUSTOMER_SERVICE + ENGINEER + OPERATIONS
COMPLAINT_ROLES           = ADMIN + CUSTOMER_SERVICE + OPERATIONS   （不含 ENGINEER）
ANNOUNCEMENT_ROLES        = ADMIN + OPERATIONS
CONTRACT_VIEW_ROLES       = ADMIN + FINANCE + CUSTOMER_SERVICE      （不含 ENGINEER / TENANT）
```

## 修改路由（共补齐 17 个）

| # | 路由 | 新增角色 |
|---|------|----------|
| 1 | `customers/renters` | `CUSTOMER_OPERATION_ROLES` |
| 2 | `customers/renters/:id` | `CUSTOMER_OPERATION_ROLES` |
| 3 | `properties/tree` | `PROPERTY_TREE_ROLES` |
| 4 | `properties/leases` | `CUSTOMER_OPERATION_ROLES` |
| 5 | `properties/leases/:id` | `CUSTOMER_OPERATION_ROLES` |
| 6 | `contracts` | `CONTRACT_VIEW_ROLES` |
| 7 | `contracts/:id` | `CONTRACT_VIEW_ROLES` |
| 8 | `billing/fee-items` | `FINANCE_ROLES` |
| 9 | `billing/bills` | `BILLING_VIEW_ROLES` |
| 10 | `billing/bills/:id` | `BILLING_VIEW_ROLES` |
| 11 | `billing/meter-readings` | `METER_ROLES` |
| 12 | `service/repairs` | `REPAIR_ROLES` |
| 13 | `service/repairs/:id` | `REPAIR_ROLES` |
| 14 | `service/complaints` | `COMPLAINT_ROLES` |
| 15 | `service/complaints/:id` | `COMPLAINT_ROLES` |
| 16 | `notice/announcements` | `ANNOUNCEMENT_ROLES` |
| 17 | `system/audit-logs` 等 | （收紧；详见源码） |

> `dashboard`、`profile`、`notice/notifications` 三个为"全员个人页"，保持不设角色。

## 一致性原则

1. `roles` 在菜单与路由 guard 中使用**同一份常量**，永远同步。
2. 菜单隐藏 ⇒ URL 同时禁止访问；不再存在通过手动拼 URL 越权的可能。
3. 所有路由的角色集合**显式不含 TENANT 与 ENGINEER**（除了 `service/repairs`，工程师必须能处理工单）。

## 风险说明

- `roleLoader` 在 client 侧执行，本质是 UX 层防护；**后端必须做对应的 JWT/角色校验**，否则恶意用户仍可直接调用 API。审计 C-02 在前端侧已闭合，但需要后端同步加固。
- 若未来新增角色（如 SUPER_TENANT），需要同步更新顶部的角色组常量。
- 客户管理（`customers/renters`）当前只允许 `CUSTOMER_OPERATION_ROLES`；若财务 / 运营有看租户档案需求需再放宽。
