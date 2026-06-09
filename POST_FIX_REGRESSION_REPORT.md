# POST_FIX_REGRESSION_REPORT — RBAC 修复后回归检测报告

> 检测范围：对比 `src/router/index.tsx`（`roleLoader`）与各页面内 `PermissionGuard` 的角色集合，识别矛盾、缺口或新引入的阻断。
> 方法：只读分析，不修改代码。

---

## 一、说明

### 校验链结构

```
URL 导航
  └─ authLoader（仅检查 token + user 存在）
       └─ roleLoader（路由层，按角色组放行/跳 /403）
            └─ PermissionGuard（组件层，控制按钮/区块的渲染）
```

两层独立：`roleLoader` 决定"能不能进页面"；`PermissionGuard` 决定"能看到哪些操作"。
当二者的角色集合出现交叉矛盾时，会产生：
- **路由放行 + 组件隐藏**：用户进入页面但看不到内容（静默空页）
- **路由阻断 + 组件包含**：用户被拒之门外，但页面设计者本意是放行（回归）

---

## 二、全路由权限矩阵

| 路由 | roleLoader 角色 | 页面级 PermissionGuard | 冲突类型 |
|------|----------------|------------------------|----------|
| `/dashboard` | ——（任意登录用户） | 无 | 无冲突 ✅ |
| `/profile` | ——（任意登录用户） | 无 | 无冲突 ✅ |
| `platform/companies` | PA | 按钮: PA | 完全对齐 ✅ |
| `platform/companies/:id` | PA | 无 | 完全对齐 ✅ |
| `org/projects` | PA/CA/PRJ | 按钮: PA/CA（子集） | 正常子集 ✅ |
| `org/projects/:id` | PA/CA/PRJ | 按钮: PA/CA（子集） | 正常子集 ✅ |
| `org/users` | PA/CA/PRJ | 按钮: PA/CA（子集） | 正常子集 ✅ |
| `org/users/:id` | PA/CA/PRJ | 无 | 完全对齐 ✅ |
| `customers/renters` | PA/CA/PRJ/CS | 按钮: PA/CA/PRJ/CS | 完全对齐 ✅ |
| `customers/renters/:id` | PA/CA/PRJ/CS | 按钮: PA/CA/PRJ/CS | 完全对齐 ✅ |
| `properties/tree` | PA/CA/PRJ/**OPS** | 按钮: PA/CA/PRJ/**CS** | **⚠ 回归 R-01** |
| `properties/leases` | PA/CA/PRJ/CS | 按钮: PA/CA/PRJ/CS | 完全对齐 ✅ |
| `properties/leases/:id` | PA/CA/PRJ/CS | 无 | 完全对齐 ✅ |
| `contracts` | PA/CA/PRJ/FIN/CS | 按钮: PA/CA/PRJ/FIN，PA/CA/CS（子集）| 正常子集 ✅ |
| `contracts/:id` | PA/CA/PRJ/FIN/CS | 无专属页面 guard | 完全对齐 ✅ |
| `billing/fee-items` | PA/CA/FIN | 按钮: PA/FIN（子集） | **⚠ 回归 R-02** |
| `billing/bills` | PA/CA/PRJ/FIN | 按钮: PA/FIN（子集） | 正常子集 ✅ |
| `billing/bills/:id` | PA/CA/PRJ/FIN | 按钮: PA/FIN（子集） | 正常子集 ✅ |
| `billing/meter-readings` | PA/CA/PRJ/FIN/OPS | 内容区: FIN/OPS/PA | **⚠ 回归 R-03** |
| `billing/payments` | PA/CA/FIN | 页面包裹: PA/CA/FIN | 完全对齐 ✅ |
| `service/repairs` | PA/CA/PRJ/CS/ENG/OPS | 按钮(批量分配): PA/PRJ/CS | 正常子集 ✅ |
| `service/repairs/:id` | PA/CA/PRJ/CS/ENG/OPS | 无 | 完全对齐 ✅ |
| `service/complaints` | PA/CA/PRJ/CS/OPS | 页面包裹: PA/CA/PRJ/CS/OPS | 完全对齐 ✅ |
| `service/complaints/:id` | PA/CA/PRJ/CS/OPS | 无 | 完全对齐 ✅ |
| `notice/announcements` | PA/CA/PRJ/OPS | 按钮(MANAGE_ROLES): PA/CA/PRJ/OPS | 完全对齐 ✅ |
| `notice/notifications` | ——（任意登录用户） | 无 | 完全对齐 ✅ |
| `reports/rent-income` | PA/CA/FIN | 导出按钮: PA/CA/PRJ/FIN/OPS | 正常超集（按钮保守）✅ |
| `reports/collection-rate` | PA/CA/FIN | 导出按钮: PA/CA/PRJ/FIN/OPS | 正常超集 ✅ |
| `reports/overdue` | PA/CA/FIN | 导出按钮: PA/CA/PRJ/FIN/OPS | 正常超集 ✅ |
| `reports/repair-analysis` | PA/CA/PRJ/OPS | 导出按钮: PA/CA/PRJ/FIN/OPS | 正常超集 ✅ |
| `reports/satisfaction` | PA/CA/PRJ/OPS | 导出按钮: PA/CA/PRJ/FIN/OPS | 正常超集 ✅ |
| `system/audit-logs` | PA/CA/PRJ/OPS | 页面包裹: PA/CA/PRJ/OPS | 完全对齐 ✅ |
| `system/settings` | PA | 页面包裹: PA | 完全对齐 ✅ |

> 角色缩写：PA=PLATFORM_ADMIN, CA=COMPANY_ADMIN, PRJ=PROJECT_ADMIN, FIN=FINANCE, CS=CUSTOMER_SERVICE, ENG=ENGINEER, OPS=OPERATIONS

---

## 三、各角色全访问验证

### PLATFORM_ADMIN
| 模块 | roleLoader | 结论 |
|------|-----------|------|
| 全部路由 | PA 存在于所有 `roleLoader` 中 | ✅ 可访问全部页面 |

### COMPANY_ADMIN
| 路由 | roleLoader | 是否包含 CA |
|------|-----------|------------|
| `platform/companies` | [PA] | ❌ 不含 CA（设计如此，公司管理员不管顶层公司） |
| 其余全部 | ✅ 含 CA 或无限制 | ✅ |
**结论**：CA 被正确排除在平台公司管理之外，其余访问能力不受影响 ✅

### PROJECT_ADMIN
| 路由 | 修复前 | 修复后 | 状态 |
|------|--------|--------|------|
| `billing/fee-items` | 无 roleLoader（可访问） | `FINANCE_ROLES`（不含PRJ） | **⚠ 新增阻断 R-02** |
| `billing/meter-readings` | 无 roleLoader（可访问） | `METER_ROLES`（含PRJ） | ✅ 无变化 |
| `billing/payments` | [FIN/PA/CA]（已有阻断） | 同左 | ✅ 无变化 |
| 其余 | ✅ | ✅ | 无影响 |

### CUSTOMER_SERVICE
| 路由 | 修复前 | 修复后 | 状态 |
|------|--------|--------|------|
| `properties/tree` | 无 roleLoader（可访问） | `PROPERTY_TREE_ROLES`（不含CS） | **⚠ 新增阻断 R-01** |
| `notice/announcements` | 无 roleLoader（可访问） | `ANNOUNCEMENT_ROLES`（不含CS） | 页面级 guard 已排除CS，UX 无差异 ✅* |
| `billing/fee-items` | 无 roleLoader | `FINANCE_ROLES`（不含CS） | CS 原本也看不到页面内操作按钮，UX 无差异 ✅* |
| `contracts` | 无 roleLoader | 含CS ✅ | ✅ |
| `service/repairs` | 无 roleLoader | 含CS ✅ | ✅ |
| `service/complaints` | 无 roleLoader | 含CS ✅ | ✅ |

> `✅*` 表示：虽然 roleLoader 新增了阻断，但页面内 PermissionGuard 原本也把该角色排除在所有操作之外，实际 UX 无差别（用户原来进入也看到的是空/只读页面）。

### FINANCE
| 路由 | roleLoader | 结论 |
|------|-----------|------|
| `billing/fee-items` | FINANCE_ROLES（含FIN）| ✅ |
| `billing/bills` | BILLING_VIEW_ROLES（含FIN）| ✅ |
| `billing/payments` | FINANCE_ROLES（含FIN）| ✅ |
| `contracts` | 含FIN ✅ | ✅ |
| `reports/rent-income` | FINANCE_ROLES（含FIN）| ✅ |
| `reports/collection-rate` | FINANCE_ROLES（含FIN）| ✅ |
| `reports/overdue` | FINANCE_ROLES（含FIN）| ✅ |
**结论**：FINANCE 可访问全部原有财务页面，无回归 ✅

### CUSTOMER_SERVICE — 投诉 / 报修 / 公告模块
| 路由 | roleLoader | 结论 |
|------|-----------|------|
| `service/repairs` | REPAIR_ROLES（含CS）| ✅ 通过 |
| `service/repairs/:id` | REPAIR_ROLES（含CS）| ✅ 通过 |
| `service/complaints` | COMPLAINT_ROLES（含CS）| ✅ 通过 |
| `service/complaints/:id` | COMPLAINT_ROLES（含CS）| ✅ 通过 |
| `notice/announcements` | ANNOUNCEMENT_ROLES（**不含CS**）| ⚠ 新增阻断，但页面内容本就对CS不可操作，见R-01注释 |

---

## 四、发现的回归问题

### R-01 【HIGH】`properties/tree` — CUSTOMER_SERVICE 被新 roleLoader 完全阻断

| 项 | 内容 |
|----|------|
| **路由** | `/properties/tree` |
| **roleLoader** | `PROPERTY_TREE_ROLES` = [PA, CA, PRJ, OPS] |
| **页面 PermissionGuard** | 4 处独立区块均写 `[PA, CA, PRJ, **CS**]` |
| **修复前** | 无 roleLoader → CS 可进入页面，可通过 PermissionGuard 看到并操作楼栋/楼层/单元 |
| **修复后** | CS 被 roleLoader 打到 `/403`，永远无法进入 |
| **影响** | 客服无法查看房源树结构，无法做楼栋/楼层/单元的新增与编辑 |
| **冲突性质** | roleLoader 排除 CS，但 PermissionGuard **显式为 CS 设计了操作能力**，二者语义直接矛盾 |

**需要修正**：`PROPERTY_TREE_ROLES` 应加入 `RoleCode.CUSTOMER_SERVICE`，与页面 PermissionGuard 对齐。

---

### R-02 【MEDIUM】`billing/fee-items` — PROJECT_ADMIN 被新 roleLoader 阻断

| 项 | 内容 |
|----|------|
| **路由** | `/billing/fee-items` |
| **roleLoader** | `FINANCE_ROLES` = [FIN, PA, CA] |
| **页面 PermissionGuard** | 操作按钮: [FIN, PA]（PRJ 本就不可操作） |
| **修复前** | 无 roleLoader → PRJ 可进入，看到只读列表 |
| **修复后** | PRJ 被 roleLoader 阻断至 `/403` |
| **影响** | 项目管理员原本可以只读查阅费项列表（了解计费规则），修复后彻底失去该能力 |
| **冲突性质** | roleLoader 收紧后语义超过页面设计预期（页面层只禁止 PRJ 操作，未禁止其查看） |

**需要修正**：评估 PRJ 是否应有只读查看费项的需求。若是，`FINANCE_ROLES` 加入 PRJ；若否，当前行为正确。

---

### R-03 【LOW】`billing/meter-readings` — COMPANY_ADMIN / PROJECT_ADMIN 进入页面后看到空内容

| 项 | 内容 |
|----|------|
| **路由** | `/billing/meter-readings` |
| **roleLoader** | `METER_ROLES` = [PA, CA, PRJ, FIN, OPS] |
| **页面 PermissionGuard** | 内容区包裹 `[FIN, OPS, PA]`（`fallback` 默认为 null） |
| **CA/PRJ 体验** | 可进入页面，看到标题 `抄表导入`，但正文全部为空（PermissionGuard fallback=null） |
| **修复前** | 无 roleLoader → 同样如此（CA/PRJ 进入也看到空页面）|
| **修复后** | 无变化 — 此问题不是修复引入的新问题，是预存的设计不一致 |
| **冲突性质** | roleLoader 与页面 PermissionGuard 不矛盾，但存在视觉混乱（菜单可见、页面为空） |

**建议**：将页面 PermissionGuard 的 roles 扩展到 `METER_ROLES`，或在 fallback 加提示文字，或修改菜单 roles 排除 CA/PRJ。**本次修复未引入**，但建议一并处理。

---

## 五、总结

| 角色 | 能否访问原有全部功能 | 说明 |
|------|---------------------|------|
| PLATFORM_ADMIN | ✅ 全部 | 无影响 |
| COMPANY_ADMIN | ✅ 全部（平台公司管理除外，设计如此） | 无影响 |
| PROJECT_ADMIN | ⚠ billing/fee-items 新增阻断 | **R-02** |
| FINANCE | ✅ 全部财务页面 | 无影响 |
| CUSTOMER_SERVICE | ⚠ properties/tree 新增阻断 | **R-01（高）** |
| ENGINEER | ✅ service/repairs（设计目标） | 无影响 |
| OPERATIONS | ✅ 报修 / 公告 / 报表 / 审计 | 无影响 |

> 最高风险：**R-01**，须立即修正 `PROPERTY_TREE_ROLES` 加入 CUSTOMER_SERVICE。
> 见 `REGRESSION_BUGS.md` 获取具体建议修改。
