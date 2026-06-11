# API 接口清单 (API_INVENTORY.md)

> 自动扫描生成时间: 2026-06-09
> 项目: SPMS 智慧物业管理系统
> 后端地址: https://www.cwuye.com/api

## 接口概览

| 序号 | 模块 | 接口数 |
|------|------|--------|
| 1 | 认证 (Auth) | 3 |
| 2 | 用户管理 (Users) | 9 |
| 3 | 平台公司管理 (Platform) | 5 |
| 4 | 项目管理 (Projects) | 6 |
| 5 | 房源管理 (Properties) | 12 |
| 6 | 合同管理 (Contracts) | 12 |
| 7 | 入住退租 (Leases) | 4 |
| 8 | 账单管理 (Billing) | 10 |
| 9 | 支付管理 (Payments) | 3 |
| 10 | 报修管理 (Repairs) | 8 |
| 11 | 投诉管理 (Complaints) | 7 |
| 12 | 公告管理 (Announcements) | 7 |
| 13 | 仪表盘 (Dashboard) | 2 |
| 14 | 报表 (Reports) | 5 |
| 15 | 审计日志 (Audit) | 2 |
| 16 | 系统设置 (Settings) | 1 |
| 17 | 通知 (Notifications) | 3 |
| 18 | 租户管理 (Renters) | 9 |
| 19 | 文件上传 (Files) | 2 |
| 20 | Excel 模板 | 1 |
| 21 | 健康检查 (Health) | 1 |
| **合计** | | **111** |

---

## 详细接口表

### 1. 认证 (Auth)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| POST | `/auth/staff/login` | 管理端登录 | 否 |
| POST | `/auth/tenant/login` | 租户端登录 | 否 |
| POST | `/auth/refresh` | 刷新 Token | 否 |
| POST | `/auth/logout` | 退出登录 | 是 |

### 2. 用户管理 (Users)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/users` | 用户列表 | 是 |
| GET | `/users/:id` | 用户详情 | 是 |
| POST | `/users` | 创建用户 | 是 |
| PATCH | `/users/:id` | 更新用户 | 是 |
| DELETE | `/users/:id` | 删除用户 | 是 |
| PUT | `/users/:id/roles` | 分配角色 | 是 |
| PUT | `/users/:id/projects` | 分配项目 | 是 |
| PUT | `/projects/assign-user-projects` | 批量分配项目 | 是 |
| PATCH | `/users/:id` (password) | 修改密码 | 是 |

### 3. 平台公司管理 (Platform)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/platform/companies` | 公司列表 | 是 |
| GET | `/platform/companies/:id` | 公司详情 | 是 |
| POST | `/platform/companies` | 创建公司 | 是 |
| PATCH | `/platform/companies/:id` | 更新公司 | 是 |
| DELETE | `/platform/companies/:id` | 删除公司 | 是 |

### 4. 项目管理 (Projects)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/projects` | 项目列表 | 是 |
| GET | `/projects/:id` | 项目详情 | 是 |
| POST | `/projects` | 创建项目 | 是 |
| PATCH | `/projects/:id` | 更新项目 | 是 |
| DELETE | `/projects/:id` | 删除项目 | 是 |
| PUT | `/projects/:id/users` | 分配项目用户 | 是 |

### 5. 房源管理 (Properties)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/properties/projects/:projectId/tree` | 房源树 | 是 |
| POST | `/properties/buildings` | 创建楼栋 | 是 |
| PUT | `/properties/buildings/:id` | 更新楼栋 | 是 |
| DELETE | `/properties/buildings/:id` | 删除楼栋 | 是 |
| POST | `/properties/floors` | 创建楼层 | 是 |
| PUT | `/properties/floors/:id` | 更新楼层 | 是 |
| DELETE | `/properties/floors/:id` | 删除楼层 | 是 |
| POST | `/properties/units` | 创建单元 | 是 |
| PUT | `/properties/units/:id` | 更新单元 | 是 |
| DELETE | `/properties/units/:id` | 删除单元 | 是 |
| POST | `/properties/units/:id/bind` | 绑定单元 | 是 |
| POST | `/properties/units/:id/unbind` | 解绑单元 | 是 |

### 6. 合同管理 (Contracts)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/contracts` | 合同列表 | 是 |
| GET | `/contracts/:id` | 合同详情 | 是 |
| POST | `/contracts` | 创建合同 | 是 |
| PATCH | `/contracts/:id` | 更新合同 | 是 |
| DELETE | `/contracts/:id` | 删除合同 | 是 |
| POST | `/contracts/:id/submit` | 提交审批 | 是 |
| POST | `/contracts/:id/finance/approve` | 财务审批 | 是 |
| POST | `/contracts/:id/finance/reject` | 财务驳回 | 是 |
| POST | `/contracts/:id/admin/sign` | 管理员签署 | 是 |
| POST | `/contracts/:id/admin/reject` | 管理员驳回 | 是 |
| POST | `/contracts/:id/terminate` | 终止合同 | 是 |
| POST | `/contracts/:id/renew` | 续签合同 | 是 |

### 7. 入住退租 (Leases)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/leases` | 入住记录列表 | 是 |
| GET | `/leases/:id` | 入住详情 | 是 |
| POST | `/leases/check-in` | 办理入住 | 是 |
| POST | `/leases/:id/check-out` | 办理退租 | 是 |

### 8. 账单管理 (Billing)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/billing/fee-items` | 费用项列表 | 是 |
| GET | `/billing/fee-items/:id` | 费用项详情 | 是 |
| POST | `/billing/fee-items` | 创建费用项 | 是 |
| PATCH | `/billing/fee-items/:id` | 更新费用项 | 是 |
| DELETE | `/billing/fee-items/:id` | 删除费用项 | 是 |
| GET | `/billing/bills` | 账单列表 | 是 |
| GET | `/billing/bills/:id` | 账单详情 | 是 |
| POST | `/billing/bills/manual` | 手动创建账单 | 是 |
| POST | `/billing/bills/generate` | 批量生成账单 | 是 |
| POST | `/billing/bills/publish` | 批量发布账单 | 是 |

### 9. 支付管理 (Payments)

| 方法 | URL | 描述 | 认证 |
|------|-----|------|------|
| GET | `/payments/orders` | 支付订单列表 | 是 |
| GET | `/payments/orders/:id` | 支付详情 | 是 |
| POST | `/payments/mock/success` | 模拟支付成功 | 是 |

### 10-21 (其余模块类似结构，省略)

---

## 响应格式说明

通过实际测试发现，后端API响应**未使用** `{code, data, message}` 统一包装格式：

- 列表接口返回: `{ items: [], page, pageSize, total, totalPages }`
- 详情接口返回: 直接返回对象
- Dashboard 返回: `{ occupancyRate, ... }` 扁平结构

**重要**: 前端 `adapter.ts` 中的 `unwrapResponse` 函数期望 `{code: 200, data: ...}` 格式，但实际后端不返回此格式。
这意味着 `unwrapResponse` 实际上不会解包数据（因为 `isWrappedResponse` 返回 false），
数据直接作为 axios response.data 返回。
