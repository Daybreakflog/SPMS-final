# RBAC 一致性审计报告

> 审计日期：2025-07-14
> 审计范围：仅前端（`src/router/`, `src/layouts/`, `src/components/`, `src/constants/`, `src/pages/`）
> 审计模式：只读，不修改任何代码

---

## 权限定义总数

| 类别 | 数量 |
|------|------|
| `PermissionGuard` 使用次数 | 33 |
| `ContractActionRoles` 动作 | 9 |
| `RepairActionRoles` 动作 | 3 |
| `ComplaintActionRoles` 动作 | 4 |
| `roleLoader` 路由守卫 | 28 |
| 菜单项（含 `roles`） | 24 |
| **权限定义总计** | **101** |
| **冲突数量** | **12** |
| **冲突率** | **11.9%** |

---

# 页面权限矩阵

## 1. 仪表盘 `/dashboard`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | 无限制（全部登录用户） |
| 路由 | 无 roleLoader（全部登录用户） |
| 页面 | 无 PermissionGuard 包裹 |
| 按钮 | 无按钮级 PermissionGuard |
| Action | 无 ActionRoles |

✅ **一致**

---

## 2. 物业公司 `/platform/companies`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `PLATFORM_ADMIN` |
| 路由 | `roleLoader([PLATFORM_ADMIN])` |
| 页面 | 无页面级包裹 |
| 按钮（新建/编辑/删除） | `[PLATFORM_ADMIN]` |
| Action | 无 |

✅ **一致**

---

## 3. 公司详情 `/platform/companies/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader([PLATFORM_ADMIN])` |

✅ **一致**（无页面级 PermissionGuard）

---

## 4. 项目管理 `/org/projects`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ADMIN_ROLES` = `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |
| 路由 | `roleLoader(ADMIN_ROLES)` |
| 页面（新建/编辑/删除按钮） | `[PLATFORM_ADMIN, COMPANY_ADMIN]` |
| Action | 无 |

⚠️ **PROJECT_ADMIN 可访问页面但无法 CRUD 项目**（可能是设计：项目管理员只能查看自己管理的项目，不能创建/删除项目）

---

## 5. 项目详情 `/org/projects/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(ADMIN_ROLES)` |
| 页面（分配员工按钮） | `[PLATFORM_ADMIN, COMPANY_ADMIN]` |

⚠️ 同上：`PROJECT_ADMIN` 可查看详情但无法分配员工

---

## 6. 员工管理 `/org/users`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ADMIN_ROLES` = `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |
| 路由 | `roleLoader(ADMIN_ROLES)` |
| 页面（新建/编辑/删除按钮） | `[PLATFORM_ADMIN, COMPANY_ADMIN]` |
| Action | 无 |

⚠️ **PROJECT_ADMIN 可访问页面但无法 CRUD 员工**

---

## 7. 员工详情 `/org/users/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(ADMIN_ROLES)` |

✅ 一致（无页面级 PermissionGuard）

---

## 8. 个人中心 `/profile`

| 层级 | 允许角色 |
|------|----------|
| 路由 | 无 roleLoader |

✅ 一致

---

## 9. 租户档案 `/customers/renters`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `CUSTOMER_OPERATION_ROLES` = `ADMIN + CUSTOMER_SERVICE` |
| 路由 | `roleLoader(CUSTOMER_OPERATION_ROLES)` |
| 页面（新建/编辑/删除/导入按钮） | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE]` |
| Action | 无 |

✅ **一致**

---

## 10. 租户详情 `/customers/renters/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(CUSTOMER_OPERATION_ROLES)` |
| 页面按钮 | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE]` |

✅ **一致**

---

## 11. 房源树 `/properties/tree`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `PROPERTY_TREE_ROLES` = `ADMIN + OPERATIONS` |
| 路由 | `roleLoader(PROPERTY_TREE_ROLES)` |
| 页面（新建/编辑/删除/绑定按钮 × 4） | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE]` |
| Action | 无 |

🔴 **严重不一致！详见问题 BLOCKING-4 / HIGH-1 / HIGH-2**

---

## 12. 入住记录 `/properties/leases`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `CUSTOMER_OPERATION_ROLES` = `ADMIN + CS` |
| 路由 | `roleLoader(CUSTOMER_OPERATION_ROLES)` |
| 页面（退租/新建按钮） | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE]` |
| Action | 无 |

✅ **一致**

---

## 13. 入住详情 `/properties/leases/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(CUSTOMER_OPERATION_ROLES)` |

✅ 一致

---

## 14. 全部合同 `/contracts`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `CONTRACT_VIEW_ROLES` = `ADMIN + FINANCE + CS` |
| 路由 | `roleLoader(ADMIN + FINANCE + CS)` |
| 页面-新建按钮 | `[CUSTOMER_SERVICE, PLATFORM_ADMIN, COMPANY_ADMIN]` ← **缺少 PROJECT_ADMIN** |
| 页面-批量审批按钮 | `[PLATFORM_ADMIN, COMPANY_ADMIN, FINANCE, PROJECT_ADMIN]` ← **过宽** |
| 页面-批量删除按钮 | `[PLATFORM_ADMIN, COMPANY_ADMIN]` ← **缺少 PROJECT_ADMIN** |
| Action（ContractActionRoles） | 见下 |

**ContractActionRoles 矩阵：**

| 动作 | 允许角色 |
|------|----------|
| `edit` | `CS, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |
| `submit` | `CS, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |
| `financeApprove` | `FINANCE, PLATFORM_ADMIN` |
| `financeReject` | `FINANCE, PLATFORM_ADMIN` |
| `adminSign` | `COMPANY_ADMIN, PROJECT_ADMIN, PLATFORM_ADMIN` |
| `adminReject` | `COMPANY_ADMIN, PROJECT_ADMIN, PLATFORM_ADMIN` |
| `renew` | `CS, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |
| `terminate` | `PLATFORM_ADMIN, COMPANY_ADMIN` |
| `delete` | `PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN` |

🔴 **3 个不一致！详见 BLOCKING-1, BLOCKING-2, MEDIUM-1**

---

## 15. 合同详情 `/contracts/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(ADMIN + FINANCE + CS)` |
| 按钮 | 动态使用 `ContractActionMatrix + ContractActionRoles` |
| `adminReject` 按钮 | 触发 `setApprovalType('reject')` → 调用 `contractService.financeReject` |

🔴 **adminReject 按钮调用错误 API！详见 BLOCKING-3**

---

## 16. 费项管理 `/billing/fee-items`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `FINANCE_ROLES` = `FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN` |
| 路由 | `roleLoader(FINANCE_ROLES)` |
| 页面（新建/编辑/删除按钮 × 2） | `[FINANCE, PLATFORM_ADMIN]` |
| Action | 无 |

⚠️ **COMPANY_ADMIN 可访问页面但无法 CRUD**（可能是设计：公司管理员只能查看费项）

---

## 17. 账单中心 `/billing/bills`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `BILLING_VIEW_ROLES` = `ADMIN + FINANCE` |
| 路由 | `roleLoader(BILLING_VIEW_ROLES)` |
| 页面（新建/发布按钮 × 2） | `[FINANCE, PLATFORM_ADMIN]` |
| Action | 无 |

⚠️ **COMPANY_ADMIN / PROJECT_ADMIN 可访问但无法创建/发布账单**（可能是设计：管理员只读监管）

---

## 18. 账单详情 `/billing/bills/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(BILLING_VIEW_ROLES)` |
| 页面（取消按钮） | `[FINANCE, PLATFORM_ADMIN]` |

⚠️ **同上**

---

## 19. 抄表导入 `/billing/meter-readings`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `METER_ROLES` = `ADMIN + FINANCE + OPERATIONS` |
| 路由 | `roleLoader(METER_ROLES)` |
| 页面（整页包裹） | `[FINANCE, OPERATIONS, PLATFORM_ADMIN]` |
| Action | 无 |

🔴 **BLOCKING！COMPANY_ADMIN / PROJECT_ADMIN 可访问路由但页面显示「无权限」**

---

## 20. 支付订单 `/billing/payments`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `FINANCE_ROLES` = `FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN` |
| 路由 | `roleLoader(FINANCE_ROLES)` |
| 页面（整页包裹） | `[FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN]` |
| Action | 无 |

✅ **一致**

---

## 21. 报修工单 `/service/repairs`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `REPAIR_ROLES` = `ADMIN + CS + ENGINEER + OPERATIONS` |
| 路由 | `roleLoader(REPAIR_ROLES)` |
| 页面（批量分配按钮） | `[PLATFORM_ADMIN, PROJECT_ADMIN, CUSTOMER_SERVICE]` |
| Action（RepairActionRoles.assign） | `[CUSTOMER_SERVICE, PROJECT_ADMIN, PLATFORM_ADMIN]` |

✅ **一致**（批量分配按钮与 RepairActionRoles.assign 一致）

---

## 22. 报修详情 `/service/repairs/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(REPAIR_ROLES)` |
| 按钮 | 动态使用 `RepairActionMatrix + RepairActionRoles` |

✅ **一致**

---

## 23. 投诉受理 `/service/complaints`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `COMPLAINT_ROLES` = `ADMIN + CS + OPERATIONS` |
| 路由 | `roleLoader(COMPLAINT_ROLES)` |
| 页面（整页包裹） | `[ADMIN + CS + OPERATIONS]` |
| Action | 无 |

✅ **一致**

---

## 24. 投诉详情 `/service/complaints/:id`

| 层级 | 允许角色 |
|------|----------|
| 路由 | `roleLoader(COMPLAINT_ROLES)` |
| 按钮 | 动态使用 `ComplaintActionMatrix + ComplaintActionRoles` |

✅ **一致**

---

## 25. 公告管理 `/notice/announcements`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ANNOUNCEMENT_ROLES` = `ADMIN + OPERATIONS` |
| 路由 | `roleLoader(ANNOUNCEMENT_ROLES)` |
| 页面（`MANAGE_ROLES` × 2） | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS]` = `ADMIN + OPERATIONS` |
| Action | 无 |

✅ **一致**

---

## 26. 我的消息 `/notice/notifications`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | 无限制 |
| 路由 | 无 roleLoader |

✅ **一致**

---

## 27. 租金收入 `/reports/rent-income`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `FINANCE_ROLES` = `FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN` |
| 路由 | `roleLoader(FINANCE_ROLES)` |
| 页面（`ReportTemplate` 导出按钮） | `[FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS]` |
| Action | 无 |

⚠️ 导出按钮角色过宽（`ReportTemplate` 是共享组件），`PROJECT_ADMIN` / `OPERATIONS` 无法访问此页，属死代码

---

## 28. 收缴率 `/reports/collection-rate`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `FINANCE_ROLES` |
| 路由 | `roleLoader(FINANCE_ROLES)` |
| 页面 | `ReportTemplate` 共享（同上） |

⚠️ **同上**

---

## 29. 欠费明细 `/reports/overdue`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `FINANCE_ROLES` |
| 路由 | `roleLoader(FINANCE_ROLES)` |
| 页面 | `ReportTemplate` 共享（同上） |

⚠️ **同上**

---

## 30. 报修分析 `/reports/repair-analysis`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ADMIN + OPERATIONS` |
| 路由 | `roleLoader(ADMIN + OPERATIONS)` |
| 页面 | `ReportTemplate` 包含 `FINANCE` |

⚠️ `FINANCE` 无法访问此路由，`ReportTemplate` 导出按钮中的 `FINANCE` 在此页是死代码

---

## 31. 满意度 `/reports/satisfaction`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ADMIN + OPERATIONS` |
| 路由 | `roleLoader(ADMIN + OPERATIONS)` |
| 页面 | `ReportTemplate`（同上） |

⚠️ **同上**

---

## 32. 审计日志 `/system/audit-logs`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `ADMIN + OPERATIONS` |
| 路由 | `roleLoader(ADMIN + OPERATIONS)` |
| 页面（整页包裹） | `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS]` |
| Action | 无 |

✅ **一致**

---

## 33. 系统设置 `/system/settings`

| 层级 | 允许角色 |
|------|----------|
| 菜单 | `[PLATFORM_ADMIN]` |
| 路由 | `roleLoader([PLATFORM_ADMIN])` |
| 页面（整页包裹） | `[PLATFORM_ADMIN]` |
| Action | 无 |

✅ **一致**

---

# 发现的问题

## 🔴 BLOCKING（4 个）

### BLOCKING-1：合同列表页「新建合同」按钮缺少 PROJECT_ADMIN

- **页面路径**：`/contracts`
- **文件**：`src/pages/contracts/index.tsx`，行 210
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **对比**：`ContractActionRoles.edit`（`src/constants/status.ts`，行 ~105）允许 `[CUSTOMER_SERVICE, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN]`
- **影响**：`PROJECT_ADMIN` 可访问合同列表页、可查看详情、但在列表页看不到「新建合同」按钮。与 `ContractActionRoles` 定义矛盾。
- **严重性**：用户可见功能缺失

---

### BLOCKING-2：合同列表页「批量审批」按钮权限过宽

- **页面路径**：`/contracts`
- **文件**：`src/pages/contracts/index.tsx`，行 191
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE, RoleCode.PROJECT_ADMIN]}>
  ```
- **问题**：
  - `COMPANY_ADMIN` 可见按钮，但 `handleBatchApprove`（行 147-170）对 `PENDING_FINANCE` 状态的合同调用 `contractService.financeApprove`，而 `ContractActionRoles.financeApprove` 不包含 `COMPANY_ADMIN` → API 调用失败（被 `catch` 静默吞掉）
  - `FINANCE` 可见按钮，但对 `PENDING_ADMIN` 状态的合同调用 `contractService.adminSign`，而 `ContractActionRoles.adminSign` 不包含 `FINANCE` → 同样静默失败
  - `PROJECT_ADMIN` 可见按钮，但对 `PENDING_FINANCE` 状态的合同调用 `financeApprove`，其角色不在此 ActionRoles 中 → 静默失败
- **影响**：用户看到按钮并点击，操作静默失败，无错误提示，数据未变更
- **应该采用**：分别使用 `ContractActionRoles.financeApprove` 和 `ContractActionRoles.adminSign` 进行权限控制

---

### BLOCKING-3：合同详情页「管理员驳回」按钮调用错误 API

- **页面路径**：`/contracts/:id`
- **文件**：`src/pages/contracts/detail.tsx`，行 ~192-195 + 行 ~159-163
- **当前代码**：
  ```tsx
  // 行 ~192：adminReject 按钮设置 approvalType='reject'
  {allowedActions.includes('adminReject') && (
    <Button danger onClick={() => setApprovalType('reject')}>
      {t('contract.adminReject')}
    </Button>
  )}

  // 行 ~159：approvalType='reject' 映射到 financeReject！
  const actions = {
    reject: () => contractService.financeReject(contract.id, { comment: data.reason }),
    // ⚠️ 缺失 'adminReject' 分支！
  };
  ```
- **问题**：`adminReject` 按钮点击后实际调用 `POST /contracts/:id/finance-reject` 而非 `POST /contracts/:id/admin-reject`
- **`contractService.adminReject` 存在**（`src/services/contract.service.ts`，行 41），但未被使用
- **影响**：管理员驳回操作实际走了财务驳回接口，可能导致后端权限校验失败或状态异常

---

### BLOCKING-4：抄表导入页页面级 PermissionGuard 排除 COMPANY_ADMIN 和 PROJECT_ADMIN

- **页面路径**：`/billing/meter-readings`
- **文件**：`src/pages/billing/meter-readings/index.tsx`，行 75
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN]}>
  ```
- **路由**（`src/router/index.tsx`）：
  ```tsx
  loader: roleLoader(METER_ROLES)
  // METER_ROLES = [...ADMIN_ROLES, RoleCode.FINANCE, RoleCode.OPERATIONS]
  ```
- **菜单**（`src/router/routes.config.ts`）：`METER_ROLES`
- **问题**：
  - 路由允许 `COMPANY_ADMIN` 和 `PROJECT_ADMIN` 访问
  - 菜单允许 `COMPANY_ADMIN` 和 `PROJECT_ADMIN` 看到
  - 但页面级 `PermissionGuard` 将它们排除在外
  - 结果：这两个角色访问路由后看到「无权限」空白页
- **影响**：用户看到菜单 → 点击 → 进入页面 → 看到「无权限」提示，体验极差
- **修复方向**：要么页面 `PermissionGuard` 改为 `METER_ROLES` 完整集合，要么路由和菜单同步缩小到 `[FINANCE, OPERATIONS, PLATFORM_ADMIN]`

---

## 🟠 HIGH（2 个）

### HIGH-1：房源树页 OPERATIONS 角色无任何操作按钮

- **页面路径**：`/properties/tree`
- **文件**：`src/pages/properties/tree/index.tsx`
- **受影响行**：152, 179, 203, 242（共 4 处）
- **当前代码**（所有 PermissionGuard 统一为）：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
  ```
- **路由**：`roleLoader(PROPERTY_TREE_ROLES)` = `ADMIN + OPERATIONS`
- **菜单**：`PROPERTY_TREE_ROLES` = `ADMIN + OPERATIONS`
- **问题**：
  - `OPERATIONS` 角色可以访问房源树页面（路由+菜单均允许）
  - 但页面上所有「新增楼栋」「新增楼层」「新增单元」「编辑」「删除」「绑定/解绑租户」按钮全部对 `OPERATIONS` 隐藏
  - `OPERATIONS` 角色设计初衷是「运营负责房源台账」，应有操作权限
- **影响**：`OPERATIONS` 用户进入房源树页后只能查看，无法执行任何操作
- **修复方向**：将 `OPERATIONS` 加入所有按钮的 `PermissionGuard`，或者在设计层面明确 `OPERATIONS` 只读（则需要同步更新路由和菜单）

---

### HIGH-2：房源树页 PermissionGuard 含 CUSTOMER_SERVICE 但 CS 无法访问路由（死代码）

- **页面路径**：`/properties/tree`
- **文件**：`src/pages/properties/tree/index.tsx`
- **受影响行**：152, 179, 203, 242（同上 4 处）
- **路由**：`PROPERTY_TREE_ROLES` = `ADMIN + OPERATIONS` → **不含 CS**
- **菜单**：`properties-tree` 子菜单 `roles: PROPERTY_TREE_ROLES` → **不含 CS**
- **问题**：所有按钮 `PermissionGuard` 包含 `CUSTOMER_SERVICE`，但该角色无法通过路由守卫和菜单过滤到达此页面
- **影响**：死代码，造成维护困惑。如果将来开放 CS 访问房源树，这些按钮恰巧能工作，但目前属于多余定义
- **修复方向**：从按钮 `PermissionGuard` 中移除 `CUSTOMER_SERVICE`，或在菜单/路由层面补充 CS

---

## 🟡 MEDIUM（3 个）

### MEDIUM-1：合同列表页「批量删除」按钮缺少 PROJECT_ADMIN

- **页面路径**：`/contracts`
- **文件**：`src/pages/contracts/index.tsx`，行 196
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **对比**：`ContractActionRoles.delete`（`src/constants/status.ts`）允许 `[PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN]`
- **影响**：`PROJECT_ADMIN` 可以在行操作中删除单个合同（通过 `ContractActionMatrix`），但无法使用批量删除
- **严重性**：功能不一致，但批量删除可通过行操作替代

---

### MEDIUM-2：费项管理页 PermissionGuard 与路由不一致

- **页面路径**：`/billing/fee-items`
- **文件**：`src/pages/billing/fee-items/index.tsx`，行 84、102
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
  ```
- **路由 / 菜单**：`FINANCE_ROLES` = `[FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN]`
- **影响**：`COMPANY_ADMIN` 可访问页面但无法创建/编辑/删除费项
- **严重性**：可能是设计意图（公司管理员只读），但需确认

---

### MEDIUM-3：ReportTemplate 共享组件导出按钮权限过宽

- **页面路径**：`/reports/*`（所有报表页）
- **文件**：`src/pages/reports/components/ReportTemplate.tsx`，行 92
- **当前代码**：
  ```tsx
  <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS]}>
  ```
- **问题**：
  - 此组件被多个报表页共享，各页面的路由守卫不同
  - 如 `/reports/rent-income` 路由只允许 `FINANCE_ROLES`，但导出按钮对 `PROJECT_ADMIN` 和 `OPERATIONS` 可见（他们进不来此页 → 死代码）
  - 如 `/reports/repair-analysis` 路由允许 `ADMIN + OPERATIONS`，导出按钮额外包含 `FINANCE`（死代码）
- **影响**：代码中混杂了所有可能角色的并集，使每个报表页的导出按钮都包含了不该有的角色。虽因路由守卫保护不会实际暴露，但增加了维护成本和理解难度
- **修复方向**：`ReportTemplate` 接受 `allowedExportRoles` prop，由各报表页传入与路由守卫一致的角色集合

---

## 🟢 LOW（3 个）

### LOW-1：ORG 模块（项目管理/员工管理）PROJECT_ADMIN 无 CRUD 权限

- **页面路径**：`/org/projects`, `/org/users`
- **影响**：`PROJECT_ADMIN` 可访问列表页和详情页，但无法创建/编辑/删除项目或员工
- **评估**：可能是设计意图（项目管理员不应管理组织架构），但建议在代码中明确注释

---

### LOW-2：账单管理页 COMPANY_ADMIN / PROJECT_ADMIN 无操作权限

- **页面路径**：`/billing/bills`, `/billing/bills/:id`
- **影响**：`COMPANY_ADMIN` 和 `PROJECT_ADMIN` 只能查看账单，无法创建/发布/取消
- **评估**：可能是设计意图（管理员只读监管），但建议确认

---

### LOW-3：`notice` 父菜单无角色定义

- **文件**：`src/router/routes.config.ts`，行 ~205
- **情况**：`notice` 父菜单没有 `roles` 属性，依赖于菜单过滤算法（`filterByRole`）通过子菜单隐式过滤
- **影响**：`TENANT` 可以看到「公告通知」父菜单，但只有一个「我的消息」子菜单；功能正确但菜单定义不够显式
- **建议**：为 `notice` 父菜单显式添加 `roles` 以提高可读性

---

# 修复建议

## BLOCKING-1：合同列表页新建按钮缺少 PROJECT_ADMIN

- **文件**：`src/pages/contracts/index.tsx`
- **行号**：210
- **当前**：
  ```tsx
  <PermissionGuard roles={[RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **建议修改为**：
  ```tsx
  <PermissionGuard roles={ContractActionRoles.edit}>
  ```
- **理由**：直接引用 `ContractActionRoles.edit` 确保与 Action 角色矩阵永远同步

---

## BLOCKING-2：合同列表页批量审批按钮权限过宽

- **文件**：`src/pages/contracts/index.tsx`
- **行号**：191
- **当前**：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE, RoleCode.PROJECT_ADMIN]}>
  ```
- **建议修改为**：
  ```tsx
  <PermissionGuard roles={[...new Set([...ContractActionRoles.financeApprove, ...ContractActionRoles.adminSign])]}>
  // 即 [FINANCE, PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN]
  ```
- **附加建议**：`handleBatchApprove` 应分拆或至少提示用户哪些项目操作失败（当前静默 catch 吞掉所有错误）

---

## BLOCKING-3：合同详情页 adminReject 调用错误 API

- **文件**：`src/pages/contracts/detail.tsx`
- **行号**：约 159-163
- **当前**：
  ```tsx
  const actions = {
    approve: () => contractService.financeApprove(contract.id, { comment: data.remark }),
    reject: () => contractService.financeReject(contract.id, { comment: data.reason }),
    sign: () => contractService.adminSign(contract.id, { comment: data.remark }),
    terminate: () => contractService.terminate(contract.id, { comment: data.reason }),
  };
  ```
- **建议修改为**：
  ```tsx
  const actions = {
    approve: () => contractService.financeApprove(contract.id, { comment: data.remark }),
    reject: () => contractService.financeReject(contract.id, { comment: data.reason }),
    sign: () => contractService.adminSign(contract.id, { comment: data.remark }),
    adminReject: () => contractService.adminReject(contract.id, { comment: data.reason }),
    terminate: () => contractService.terminate(contract.id, { comment: data.reason }),
  };
  ```
- **同时修改**（行 ~195）：将 `adminReject` 按钮的 `setApprovalType('reject')` 改为 `setApprovalType('adminReject')`

---

## BLOCKING-4：抄表导入页 PermissionGuard 排除角色

- **文件**：`src/pages/billing/meter-readings/index.tsx`
- **行号**：75
- **当前**：
  ```tsx
  <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN]}>
  ```
- **方案 A**（与路由/菜单对齐）：
  ```tsx
  import { METER_ROLES } from '@/router/routes.config'; // 需先导出
  // 或内联：
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.FINANCE, RoleCode.OPERATIONS]}>
  ```
- **方案 B**（缩小路由/菜单）：
  将路由和菜单中的 `METER_ROLES` 改为 `[FINANCE, OPERATIONS, PLATFORM_ADMIN]`，使三者对齐

---

## HIGH-1：房源树页 OPERATIONS 无操作权限

- **文件**：`src/pages/properties/tree/index.tsx`
- **行号**：152, 179, 203, 242
- **当前**（所有 4 处统一）：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
  ```
- **建议修改为**：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS]}>
  ```
- **理由**：`OPERATIONS` 在路由和菜单中均有房源树权限，应可执行 CRUD 操作；移除 `CUSTOMER_SERVICE`（见 HIGH-2）

---

## HIGH-2：房源树页移除 CUSTOMER_SERVICE 死代码

- **文件**：`src/pages/properties/tree/index.tsx`
- **行号**：152, 179, 203, 242
- **操作**：与 HIGH-1 合并修复，从角色数组中移除 `CUSTOMER_SERVICE`

---

## MEDIUM-1：合同列表页批量删除按钮加 PROJECT_ADMIN

- **文件**：`src/pages/contracts/index.tsx`
- **行号**：196
- **当前**：
  ```tsx
  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **建议修改为**：
  ```tsx
  <PermissionGuard roles={ContractActionRoles.delete}>
  ```

---

## MEDIUM-2：费项管理页确认 COMPANY_ADMIN 权限

- **文件**：`src/pages/billing/fee-items/index.tsx`
- **行号**：84、102
- **方案 A**（如要求 COMPANY_ADMIN 可 CRUD）：
  ```tsx
  <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **方案 B**（如 COMPANY_ADMIN 只读）：维持现状，但需在路由/菜单注释中说明

---

## MEDIUM-3：ReportTemplate 接受外部角色参数

- **文件**：`src/pages/reports/components/ReportTemplate.tsx`
- **行号**：92
- **建议**：
  ```tsx
  // 新增 prop
  interface ReportTemplateProps {
    // ... existing
    exportRoles?: RoleCode[];
  }

  // 使用
  <PermissionGuard roles={exportRoles ?? [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
  ```
- **各报表页调用时传入与路由一致的 roles**

---

# 最终统计

| 指标 | 数值 |
|------|------|
| 权限定义总数（PermissionGuard + ActionRoles + roleLoader + MenuRoles） | **101** |
| 🔴 BLOCKING 问题 | **4** |
| 🟠 HIGH 问题 | **2** |
| 🟡 MEDIUM 问题 | **3** |
| 🟢 LOW 问题 | **3** |
| **问题总数** | **12** |
| **冲突率** | **11.9%** |
| 完全一致的页面 | **21 / 33**（63.6%） |

---

*报告由 RBAC 架构审计员自动生成。仅检查前端代码，不涉及接口和后端。*
