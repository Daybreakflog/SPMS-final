# CONTRACT_PERMISSION_REPORT — 合同操作权限收紧报告

## 背景

审计项 **H-03**：`ContractActionRoles.delete` 包含 `CUSTOMER_SERVICE`，删除权限过宽。同时 `terminate` 允许 `PROJECT_ADMIN` 终止已生效合同，权限过粗。

## 修改文件

`src/constants/status.ts`

## 修改对照表

| 操作 | 旧角色集 | 新角色集 | 理由 |
|------|---------|---------|------|
| `edit` | CS, PA, CA | CS, PA, CA, **PRJ** | 项目管理员也可编辑草稿，原表漏给 |
| `submit` | CS, PA, CA | CS, PA, CA, **PRJ** | 同上 |
| `financeApprove` | FIN, PA | FIN, PA | 不变 |
| `financeReject` | FIN, PA | FIN, PA | 不变 |
| `adminSign` | CA, PRJ, PA | CA, PRJ, PA | 不变 |
| `adminReject` | CA, PRJ, PA | CA, PRJ, PA | 不变 |
| `renew` | CS, PA, CA | CS, PA, CA, **PRJ** | 项目管理员通常发起续签 |
| `terminate` | PA, CA, PRJ | **PA, CA** | 终止已生效合同事关收费 / 法务，仅交给公司 / 平台管理员 |
| `delete` | **CS**, PA, CA | PA, CA, **PRJ** | **移除 CS**；新增 PRJ 仅在草稿 / 已驳回状态下生效（`ContractActionMatrix` 限制） |

## 业务原则验证

1. **客服不能删除已生效合同** ✅
   `ContractActionMatrix[ACTIVE] = ['renew', 'terminate']`，本身不暴露 delete；同时 `delete` 已从客服移除，双保险。
2. **工程师不能管理合同** ✅
   `ENGINEER` 不出现在任何 `ContractActionRoles` 中；同时 `contracts` / `contracts/:id` 路由 guard 已禁止 ENGINEER 进入页面（见 `RBAC_FIX_REPORT.md`）。
3. **租户不能管理合同** ✅
   `TENANT` 不出现在任何 `ContractActionRoles` 中；路由 guard 同样不放行。

## 风险说明

- 客服在生产中可能仍会请求"误删一个草稿合同"；如需补回，可单独建立 `softDelete` 操作并细化权限，避免直接放开 `delete`。
- `terminate` 收紧后，PROJECT_ADMIN 不再可终止合同；如确需让项目级管理员保留该能力，需补充审批流程而非直接放开。
- 服务端必须复制同一份权限矩阵：前端的 `ContractActionRoles` 仅决定按钮是否渲染，不能替代后端校验。
