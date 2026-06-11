# 业务流程审计报告 (BUSINESS_FLOW_AUDIT.md)

> **审计日期**: 2026-06-09
> **审计方法**: 跟踪每条业务链路从页面→服务→API 的完整调用链
> **验证范围**: src/pages/ + src/services/ + src/components/ + Swagger

---

## 概览

| # | 业务流程 | 前端页面 | 后端API | 状态 | 关键风险 |
|---|---------|:---:|:---:|:---:|------|
| 1 | 用户管理 | ✅ | ✅ | 🟡 部分完成 | 删除无二次确认机制 |
| 2 | 项目管理 | ✅ | ✅ | 🟡 部分完成 | getUsers 返回空数组 |
| 3 | 房源管理 | ✅ | ✅ | 🟢 完整 | - |
| 4 | 租户入住 | ✅ | ✅ | 🟡 部分完成 | check-in 表单完整但未实测 |
| 5 | 合同签约 | ✅ | ✅ | 🟢 完整 | 状态机完整，角色矩阵已定义 |
| 6 | 账单生成 | ✅ | ✅ | 🟡 部分完成 | 批量生成未实测 |
| 7 | 支付流程 | ⚠️ | ⚠️ | 🔴 缺失 | 无真实支付网关集成 |
| 8 | 报修流程 | ✅ | ✅ | 🟡 部分完成 | 消息系统未验证 |
| 9 | 投诉流程 | ✅ | ✅ | 🟡 部分完成 | 申诉流转未验证 |
| 10 | 公告流程 | ✅ | ✅ | 🟢 完整 | CRUD 已实测通过 |

---

## 1. 用户管理

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/org/users/index.tsx → userService.list() → GET /users
src/pages/org/users/detail.tsx → userService.detail() → GET /users/:id
UserFormDrawer → userService.create() → POST /users
UserFormDrawer → userService.update() → PATCH /users/:id
UserFormDrawer → userService.changePassword() → PATCH /users/:id
行内操作 → userService.assignRoles() → PUT /users/:id/roles
行内操作 → userService.assignProjects() → PUT /users/:id/projects
```

### 相关文件
- `src/pages/org/users/index.tsx` - 用户列表页
- `src/pages/org/users/detail.tsx` - 用户详情页
- `src/pages/org/users/components/UserFormDrawer.tsx` - 创建/编辑表单
- `src/services/user.service.ts` - 服务层

### 缺失环节
1. 删除用户操作缺少二次确认对话框（`src/pages/org/users/index.tsx` 中未找到批量删除相关 UI）
2. `userService.changePassword` 发送的是 `{ password: data.newPassword }`，但 Swagger 显示 PATCH `/users/:id` 的 DTO 字段可能不同
3. 批量分配项目 (`PUT /projects/assign-user-projects`) 前端有调用但页面入口不明

### 修复建议
- 在 `src/pages/org/users/index.tsx` 中添加删除确认 `Modal.confirm`
- 验证 changePassword 的请求体与后端 DTO 一致

---

## 2. 项目管理

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/org/projects/index.tsx → projectService.list() → GET /projects
src/pages/org/projects/detail.tsx → projectService.detail() → GET /projects/:id
ProjectFormDrawer → projectService.create() → POST /projects
ProjectFormDrawer → projectService.update() → PATCH /projects/:id
```

### 缺失环节
1. **`projectService.getUsers(_id)` 始终返回 `[]`**
   - 文件: `src/services/project.service.ts:21`
   - 证据: `getUsers: (_id: string): Promise<ProjectUser[]> => Promise.resolve([])`
   - 影响: 项目详情页中"项目成员" Tab 永远为空
2. Swagger 有 `PUT /projects/:id/users` (分配用户) 但无 `GET /projects/:id/users` (查询用户)

### 修复建议
- 协调后端补充 `GET /projects/:id/users` 接口
- 临时方案：从 `/users` 列表按 projectId 筛选

---

## 3. 房源管理

**当前状态**: 🟢 完整

### 调用链路
```
src/pages/properties/tree/index.tsx → propertyService.getTree() → GET /properties/projects/:projectId/tree
→ propertyService.createBuilding() → POST /properties/buildings
→ propertyService.createFloor() → POST /properties/floors
→ propertyService.createUnit() → POST /properties/units
→ propertyService.bindUnit() → POST /properties/units/:id/bind
→ propertyService.unbindUnit() → POST /properties/units/:id/unbind
```

### 评价
- 房源树 CRUD 完整，楼栋/楼层/单元三级结构均已对接
- 绑定/解绑单元功能完整
- PermissionGuard 保护了写操作按钮

---

## 4. 租户入住

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/customers/renters/index.tsx → renterService.list() → GET /renters
src/pages/properties/leases/index.tsx → leaseService.list() → GET /leases
CheckInDrawer → leaseService.checkIn() → POST /leases/check-in
CheckOutModal → leaseService.checkOut() → POST /leases/:id/check-out
```

### 相关文件
- `src/pages/customers/renters/index.tsx`
- `src/pages/customers/renters/components/RenterFormDrawer.tsx`
- `src/pages/properties/leases/index.tsx`
- `src/pages/properties/leases/components/CheckInDrawer.tsx`
- `src/pages/properties/leases/components/CheckOutModal.tsx`

### 缺失环节
1. CheckInDrawer 存在但未在实际 API 调用中验证
2. 入住时需要选择单元，需要先调用房源树接口获取空闲单元
3. 退租时需要结算费用，前端未体现此逻辑

### 修复建议
- 验证 check-in/check-out 与后端 DTO 字段对应关系

---

## 5. 合同签约

**当前状态**: 🟢 完整

### 调用链路
```
src/pages/contracts/index.tsx → contractService.list() → GET /contracts
                              → contractService.create() → POST /contracts
                              → contractService.submit() → POST /contracts/:id/submit
                              → contractService.financeApprove() → POST /contracts/:id/finance/approve
                              → contractService.financeReject() → POST /contracts/:id/finance/reject
                              → contractService.adminSign() → POST /contracts/:id/admin/sign
                              → contractService.adminReject() → POST /contracts/:id/admin/reject
                              → contractService.renew() → POST /contracts/:id/renew
                              → contractService.terminate() → POST /contracts/:id/terminate
```

### 评价
- **状态机完整**: `src/constants/status.ts` 定义了完整的 `ContractActionMatrix` 和 `ContractActionRoles`
- **角色矩阵**: 各状态允许的操作 + 各操作需要的角色均已定义
- **前端权限**: `useContractActions()` 按用户角色动态过滤可用操作
- ApplovalModal、RenewDrawer 等组件完整

### 潜在问题
- `delete` 操作允许 `CUSTOMER_SERVICE` 角色 - 风险较高
  - 文件: `src/constants/status.ts:104`
  - 证据: `delete: ['CUSTOMER_SERVICE', 'PLATFORM_ADMIN', 'COMPANY_ADMIN']`

### 修复建议
- 审查 CUSTOMER_SERVICE 是否应该能删除合同

---

## 6. 账单生成

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/billing/fee-items/index.tsx → billingService.feeItemList() → GET /billing/fee-items
                                       → billingService.feeItemCreate() → POST /billing/fee-items
src/pages/billing/bills/index.tsx → billingService.billList() → GET /billing/bills
                                   → billingService.billManualCreate() → POST /billing/bills/manual
                                   → billingService.billGenerate() → POST /billing/bills/generate
                                   → billingService.billPublish() → POST /billing/bills/publish
src/pages/billing/meter-readings/index.tsx → billingService.meterReadingImport() → POST /billing/meter-readings/import
```

### 相关文件
- `src/pages/billing/fee-items/index.tsx`
- `src/pages/billing/fee-items/components/FeeItemFormDrawer.tsx`
- `src/pages/billing/bills/index.tsx`
- `src/pages/billing/bills/detail.tsx`
- `src/pages/billing/bills/components/BillFormDrawer.tsx`
- `src/pages/billing/bills/components/BillGenerateModal.tsx`
- `src/pages/billing/meter-readings/index.tsx`

### 缺失环节
1. 批量生成/发布账单功能未在真实 API 上验证
2. 抄表导入 - 前端有页面和导入功能，依赖 Excel 模板下载接口
3. 逾期账单催收逻辑前端未实现

---

## 7. 支付流程

**当前状态**: 🔴 缺失

### 调用链路
```
src/pages/billing/payments/index.tsx → paymentService.list() → GET /payments/orders
                                     → paymentService.mockSuccess() → POST /payments/mock/success
```

### 评价
- **无真实支付网关**: 只有 `mockSuccess` 模拟支付
- **无支付创建**: Swagger 有 `POST /payments/orders` (创建订单) 但前端未调用
- **无支付回调**: Swagger 有 `POST /payments/notify` 但这是后端接收回调的接口
- **无微信/支付宝集成**: 枚举定义了 WECHAT/ALIPAY/BANK 但无对应前端流程

### 涉及文件
- `src/pages/billing/payments/index.tsx`
- `src/services/payment.service.ts`

### 修复建议
- 这是**整个系统上线前必须解决的阻断问题**
- 需要集成真实支付 SDK 或至少对接支付创建+查询接口

---

## 8. 报修流程

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/service/repairs/index.tsx → repairService.list() → GET /repairs
                                    → repairService.assign() → POST /repairs/:id/assign
                                    → repairService.progress() → POST /repairs/:id/progress
                                    → repairService.complete() → POST /repairs/:id/complete
src/pages/service/repairs/detail.tsx → repairService.detail() → GET /repairs/:id
                                     → repairService.rating() → POST /repairs/:id/rating
                                     → repairService.getMessages() → GET /repairs/:id/messages
                                     → repairService.sendMessage() → POST /repairs/:id/messages
```

### 状态流转
```
SUBMITTED → ASSIGNED → IN_PROGRESS → COMPLETED → RATED
```

### 相关文件
- `src/pages/service/repairs/index.tsx`
- `src/pages/service/repairs/detail.tsx`
- `src/pages/service/repairs/components/AssignModal.tsx`
- `src/pages/service/repairs/components/ProgressModal.tsx`
- `src/pages/service/repairs/components/CompleteModal.tsx`
- `src/pages/service/repairs/components/RepairMessageList.tsx`

### 缺失环节
1. 消息系统未在真实 API 上验证
2. AssignModal 需要选择工程师 - 需要获取工程师列表接口
3. 无报修创建入口（报修通常由租户端发起，管理端可能不需要）

---

## 9. 投诉流程

**当前状态**: 🟡 部分完成

### 调用链路
```
src/pages/service/complaints/index.tsx → complaintService.list() → GET /complaints
                                        → complaintService.analyze() → POST /complaints/:id/analysis
                                        → complaintService.appeal() → POST /complaints/:id/appeals
                                        → complaintService.resolveAppeal() → POST /complaints/:id/appeals/:appealId/resolve
                                        → complaintService.close() → POST /complaints/:id/close
```

### 状态流转
```
SUBMITTED → ANALYZING → APPEALING → CLOSED
```

### 相关文件
- `src/pages/service/complaints/index.tsx`
- `src/pages/service/complaints/components/AnalysisModal.tsx`
- `src/pages/service/complaints/components/AppealModal.tsx`
- `src/pages/service/complaints/components/AppealResolveModal.tsx`
- `src/pages/service/complaints/components/CloseModal.tsx`

### 缺失环节
1. 申诉-驳回-再申诉的循环流转逻辑未验证
2. 投诉创建入口（同样可能由租户端发起）

---

## 10. 公告流程

**当前状态**: 🟢 完整

### 调用链路
```
src/pages/notice/announcements/index.tsx → announcementService.list() → GET /announcements
                                          → announcementService.create() → POST /announcements
                                          → announcementService.update() → PATCH /announcements/:id
                                          → announcementService.remove() → DELETE /announcements/:id
                                          → announcementService.publish() → PATCH /announcements/:id {publish:true}
                                          → announcementService.archive() → PATCH /announcements/:id {status:0}
```

### 评价
- 唯一一个有实际 HTTP 测试验证的完整 CRUD 流程
- publish/archive 复用 PATCH 接口，通过不同参数区分，与 Swagger 一致
- 前端 `MANAGE_ROLES` 常量定义了可管理公告的角色

---

## 汇总

| 状态 | 流程数 | 列表 |
|:---:|:---:|------|
| 🟢 完整 | 3 | 房源管理、合同签约、公告流程 |
| 🟡 部分完成 | 6 | 用户管理、项目管理、租户入住、账单生成、报修流程、投诉流程 |
| 🔴 缺失 | 1 | 支付流程 |

### 全局缺失

1. **无租户端 (TENANT)** 前端页面 - 所有流程都基于管理端视角
2. **仪表盘** 数据依赖后端，前端仅展示
3. **报表** 页面使用统一 `ReportTemplate` 组件，依赖后端数据
4. **审计日志** 仅查询，未发现数据写入入口（应由后端自动记录）
5. **系统设置** 全部是硬编码假数据（详见 CRITICAL_ISSUES）
