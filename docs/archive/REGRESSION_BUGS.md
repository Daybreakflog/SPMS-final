# REGRESSION_BUGS — RBAC 修复引入的回归 Bug 清单

> 以下 Bug 由 `POST_FIX_REGRESSION_REPORT.md` 识别，均由 `src/router/index.tsx` 中新增 roleLoader 导致。
> 本文件只列明具体修改位置；不在此执行修改（需人工审批后操作）。

---

## BUG-01 【HIGH 必修】`properties/tree` — CUSTOMER_SERVICE 被错误阻断

### 现象

CUSTOMER_SERVICE 导航至 `/properties/tree` 时被 `roleLoader` 重定向至 `/403`。

### 根因

修复时将 `properties/tree` 的 roleLoader 设为 `PROPERTY_TREE_ROLES`，  
定义为 `[PA, CA, PRJ, OPS]`，未包含 `CUSTOMER_SERVICE`。  

但页面内 4 处 `PermissionGuard` 均写明 `[PA, CA, PRJ, **CS**]`，  
说明页面原始设计者明确允许 CS 查看并操作房源树。

### 受影响文件

```
src/router/index.tsx        — 第 20 行 PROPERTY_TREE_ROLES 定义
src/router/routes.config.ts — properties-tree 菜单 roles 字段
```

### 最小修正方案（供人工审批）

```ts
// src/router/index.tsx 第 20 行
// 当前：
const PROPERTY_TREE_ROLES = [...ADMIN_ROLES, RoleCode.OPERATIONS];
// 建议：
const PROPERTY_TREE_ROLES = [...ADMIN_ROLES, RoleCode.OPERATIONS, RoleCode.CUSTOMER_SERVICE];
```

```ts
// src/router/routes.config.ts — properties-tree 子项
// 当前：
{ key: 'properties-tree', ..., roles: PROPERTY_TREE_ROLES }
// 建议：同上定义更新后自动同步，无需单独改
```

### 验证方式

以 CUSTOMER_SERVICE 角色登录后访问 `/properties/tree`，应能正常进入并看到楼栋编辑按钮，而非跳转 `/403`。

---

## BUG-02 【MEDIUM 评估后修正】`billing/fee-items` — PROJECT_ADMIN 被意外阻断

### 现象

PROJECT_ADMIN 导航至 `/billing/fee-items` 时被 roleLoader 重定向至 `/403`。

### 根因

修复时将 `billing/fee-items` 的 roleLoader 设为 `FINANCE_ROLES = [FIN, PA, CA]`，  
`PROJECT_ADMIN` 不在其中。

修复前无 roleLoader，PRJ 可进入并以只读模式查看费项列表（页面内的编辑/删除按钮已经被 `[FIN, PA]` 的 PermissionGuard 保护）。

### 受影响文件

```
src/router/index.tsx        — 第 22 行 FINANCE_ROLES 定义
src/router/routes.config.ts — billing-fee-items 菜单 roles 字段
```

### 决策点

需要业务确认：**项目管理员是否有必要只读查阅费项列表？**

- 若是 → 将 `FINANCE_ROLES` 更名为 `FINANCE_MANAGE_ROLES`，并为路由单独指定 `[...FINANCE_ROLES, RoleCode.PROJECT_ADMIN]`
- 若否 → 当前行为正确，关闭此 Bug，无需修改

### 最小修正方案（供人工审批，仅当业务需要 PRJ 只读访问时）

```ts
// src/router/index.tsx — billing/fee-items 路由
// 当前：
{ path: 'billing/fee-items', loader: roleLoader(FINANCE_ROLES), ... }
// 建议：
{ path: 'billing/fee-items', loader: roleLoader([...FINANCE_ROLES, RoleCode.PROJECT_ADMIN]), ... }
```

同步更新 `routes.config.ts` 中 `billing-fee-items` 的 `roles` 字段。

---

## BUG-03 【LOW 建议修正】`billing/meter-readings` — CA/PRJ 进入后内容为空（预存问题）

### 现象

COMPANY_ADMIN 或 PROJECT_ADMIN 访问 `/billing/meter-readings`，进入页面但内容区（步骤条 + 上传操作）不显示，只有页面标题。

### 根因

页面内的 PermissionGuard 包裹内容区的 roles 为 `[FIN, OPS, PA]`，  
CA 和 PRJ 可通过 roleLoader 进入但被页面 PermissionGuard 过滤，fallback 为 `null`。  
此问题不是本次修复引入，但修复将 CA/PRJ 纳入 `METER_ROLES` 后使该不一致更加明显。

### 受影响文件

```
src/pages/billing/meter-readings/index.tsx  — 第 75 行 PermissionGuard roles
```

### 修正选项

选项A（扩展页面 PermissionGuard）：
```tsx
// 当前：
<PermissionGuard roles={[RoleCode.FINANCE, RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN]}>
// 建议：
<PermissionGuard roles={METER_ROLES}>  {/* 与路由 roleLoader 保持一致 */}
```

选项B（收窄 METER_ROLES，将 CA/PRJ 排除）：  
则 CA/PRJ 无法进入页面，也不会出现空内容。  
同步更新路由 roleLoader 与菜单 roles。

选项C（维持现状）：  
CA/PRJ 进入后看到空内容，但不影响核心功能。如业务认为 CA/PRJ 不需要这个功能，可接受。

---

## 优先级建议

| Bug | 优先级 | 建议行动 |
|-----|--------|---------|
| BUG-01 | HIGH | 立即修正，客服团队日常依赖房源树操作 |
| BUG-02 | MEDIUM | 与产品确认 PRJ 只读需求后修正 |
| BUG-03 | LOW | 迭代中顺手修正，不阻塞上线 |
