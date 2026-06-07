# 智慧物业 1.0 API 说明

本文档描述智慧物业管理系统后端 REST API，供后台 Web 与租户小程序对接使用。

## 1. 基本信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/api` |
| 数据格式 | JSON，`Content-Type: application/json` |
| 字符编码 | UTF-8 |

## 2. 认证方式

除「健康检查」「登录」「支付回调」等公开接口外，其余接口均需在请求头携带 JWT：

```http
Authorization: Bearer <accessToken>
```

### 2.1 登录接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/staff/login` | 管理端账号密码登录 |
| POST | `/auth/tenant/login` | 租户端账号密码登录 |
| POST | `/auth/tenant/register` | 租户端注册 |
| POST | `/auth/wx-login` | 微信登录（租户端传 `clientType: "tenant"`） |
| POST | `/auth/tenant/bind-renter` | 租户绑定档案（需登录） |
| POST | `/auth/refresh` | 刷新令牌 |
| POST | `/auth/logout` | 退出登录（需登录） |

**管理端登录请求体：**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**登录成功响应：**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "username": "admin",
    "realName": "系统管理员",
    "roles": ["PLATFORM_ADMIN", "COMPANY_ADMIN"],
    "companyId": "...",
    "companyName": "示例物业管理有限公司",
    "projectIds": ["..."],
    "userType": "STAFF"
  }
}
```

租户登录响应中 `userType` 为 `TENANT`，并包含 `renterProfileId`、`renterProfileName` 等字段。

### 2.2 种子账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 平台/公司管理员 | `admin` | `admin123` |
| 租户 | `tenant` | `tenant123` |

## 3. 统一响应规范

### 3.1 成功响应

业务接口直接返回数据对象或数组，例如：

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "totalPages": 0
}
```

### 3.2 错误响应

HTTP 状态码非 2xx 时，统一格式：

```json
{
  "code": 401,
  "message": "密码错误",
  "data": null
}
```

常见状态码：`400` 参数错误、`401` 未登录、`403` 无权限、`404` 资源不存在、`500` 服务器错误。

### 3.3 分页参数

列表接口普遍支持：

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | 1 | 页码 |
| `pageSize` | number | 20 | 每页条数（最大 200） |

## 4. 角色与权限

系统采用 RBAC，预设角色如下：

| 角色代码 | 说明 |
|----------|------|
| `PLATFORM_ADMIN` | 平台超管，可跨公司访问 |
| `COMPANY_ADMIN` | 物业公司管理员 |
| `PROJECT_ADMIN` | 项目管理员 |
| `FINANCE` | 财务人员 |
| `CUSTOMER_SERVICE` | 客服人员 |
| `ENGINEER` | 工程/维修人员 |
| `OPERATIONS` | 运营人员（投诉分析） |
| `TENANT` | 租户 |

**数据隔离规则：**

- 平台超管：全部数据
- 公司级角色：限本公司（`companyId`）
- 项目级角色：限已授权项目（`projectIds`）
- 租户：仅限本人档案关联的合同、账单、工单等

## 5. 接口清单

> 标注「需登录」的接口均需 `Authorization` 头。未标注角色的接口，登录即可访问（受数据范围约束）。

### 5.1 健康检查

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/health` | 否 | 服务健康状态（DB、Redis） |

---

### 5.2 认证 `/auth`

见 [2.1 登录接口](#21-登录接口)。

---

### 5.3 平台管理 `/platform/companies`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/platform/companies` | PLATFORM_ADMIN | 物业公司列表 |
| GET | `/platform/companies/:id` | PLATFORM_ADMIN | 公司详情 |
| POST | `/platform/companies` | PLATFORM_ADMIN | 创建公司 |
| PATCH | `/platform/companies/:id` | PLATFORM_ADMIN | 更新公司 |
| DELETE | `/platform/companies/:id` | PLATFORM_ADMIN | 删除公司 |

---

### 5.4 项目管理 `/projects`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/projects` | 管理端 | 项目列表 |
| GET | `/projects/:id` | 管理端 | 项目详情 |
| POST | `/projects` | PLATFORM_ADMIN, COMPANY_ADMIN | 创建项目 |
| PATCH | `/projects/:id` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | 更新项目 |
| DELETE | `/projects/:id` | PLATFORM_ADMIN, COMPANY_ADMIN | 删除项目 |
| PUT | `/projects/assign-user-projects` | PLATFORM_ADMIN, COMPANY_ADMIN | 为用户分配项目 |
| PUT | `/projects/:id/users` | PLATFORM_ADMIN, COMPANY_ADMIN | 为项目分配用户 |

---

### 5.5 员工用户 `/users`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/users` | PLATFORM_ADMIN, COMPANY_ADMIN | 员工列表 |
| GET | `/users/:id` | PLATFORM_ADMIN, COMPANY_ADMIN | 员工详情 |
| POST | `/users` | PLATFORM_ADMIN, COMPANY_ADMIN | 创建员工 |
| PATCH | `/users/:id` | PLATFORM_ADMIN, COMPANY_ADMIN | 更新员工 |
| DELETE | `/users/:id` | PLATFORM_ADMIN, COMPANY_ADMIN | 删除员工 |
| PUT | `/users/:id/roles` | PLATFORM_ADMIN, COMPANY_ADMIN | 分配角色 |
| PUT | `/users/:id/projects` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN | 分配项目 |

---

### 5.6 租户管理 `/renters`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/renters/me` | TENANT | 我的档案 |
| GET | `/renters` | 管理端 | 租户档案列表 |
| GET | `/renters/:id` | 管理端 | 档案详情 |
| POST | `/renters` | 管理端 | 创建档案 |
| PUT | `/renters/:id` | 管理端 | 更新档案 |
| DELETE | `/renters/:id` | 管理端 | 删除档案 |
| GET | `/renters/:id/accounts` | 管理端 | 账号列表 |
| POST | `/renters/:id/accounts` | 管理端 | 创建登录账号 |
| PATCH | `/renters/accounts/:accountId` | 管理端 | 更新账号 |
| POST | `/renters/accounts/:accountId/reset-password` | 管理端 | 重置密码 |

---

### 5.7 房源管理 `/properties`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/properties/my-units` | TENANT | 我的房源 |
| GET | `/properties/projects/:projectId/tree` | 管理端 | 楼栋/楼层/单元树 |
| POST | `/properties/buildings` | 管理端 | 创建楼栋 |
| PUT | `/properties/buildings/:id` | 管理端 | 更新楼栋 |
| DELETE | `/properties/buildings/:id` | 管理端 | 删除楼栋 |
| POST | `/properties/floors` | 管理端 | 创建楼层 |
| PUT | `/properties/floors/:id` | 管理端 | 更新楼层 |
| DELETE | `/properties/floors/:id` | 管理端 | 删除楼层 |
| POST | `/properties/units` | 管理端 | 创建单元 |
| PUT | `/properties/units/:id` | 管理端 | 更新单元 |
| DELETE | `/properties/units/:id` | 管理端 | 删除单元 |
| POST | `/properties/units/:id/bind` | 管理端 | 绑定租户 |
| POST | `/properties/units/:id/unbind` | 管理端 | 解绑租户 |

---

### 5.8 入住退租 `/leases`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/leases/my` | TENANT | 我的入住记录 |
| GET | `/leases` | 管理端 | 入住记录列表 |
| GET | `/leases/:id` | 管理端 | 记录详情 |
| POST | `/leases/check-in` | 管理端 | 办理入住 |
| POST | `/leases/:id/check-out` | 管理端 | 办理退租 |

---

### 5.9 合同管理 `/contracts`

**审批流程：** `DRAFT` → 提交 → `PENDING_FINANCE` → 财务审批 → `PENDING_ADMIN` → 管理员签署 → `ACTIVE`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/contracts` | 全部 | 合同列表（租户仅看自己的） |
| GET | `/contracts/:id` | 全部 | 合同详情 |
| POST | `/contracts` | CUSTOMER_SERVICE 等 | 创建草稿 |
| PATCH | `/contracts/:id` | CUSTOMER_SERVICE 等 | 更新草稿 |
| DELETE | `/contracts/:id` | CUSTOMER_SERVICE 等 | 删除草稿 |
| POST | `/contracts/:id/submit` | CUSTOMER_SERVICE 等 | 提交审批 |
| POST | `/contracts/:id/finance/approve` | FINANCE 等 | 财务通过 |
| POST | `/contracts/:id/finance/reject` | FINANCE 等 | 财务驳回 |
| POST | `/contracts/:id/admin/sign` | COMPANY_ADMIN, PROJECT_ADMIN | 管理员签署 |
| POST | `/contracts/:id/admin/reject` | COMPANY_ADMIN, PROJECT_ADMIN | 管理员驳回 |
| POST | `/contracts/:id/terminate` | 管理端 | 终止合同 |
| POST | `/contracts/:id/renew` | CUSTOMER_SERVICE 等 | 续签（新建草稿） |

---

### 5.10 缴费管理 `/billing`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/billing/fee-items` | 全部 | 费项列表 |
| GET | `/billing/fee-items/:id` | 全部 | 费项详情 |
| POST | `/billing/fee-items` | FINANCE 等 | 创建费项 |
| PATCH | `/billing/fee-items/:id` | FINANCE 等 | 更新费项 |
| DELETE | `/billing/fee-items/:id` | FINANCE 等 | 删除费项 |
| GET | `/billing/bills` | 全部 | 账单列表 |
| GET | `/billing/bills/:id` | 全部 | 账单详情 |
| POST | `/billing/bills/manual` | FINANCE 等 | 手工创建账单 |
| POST | `/billing/bills/generate` | FINANCE 等 | 批量生成账单 |
| POST | `/billing/bills/publish` | FINANCE 等 | 发布账单至租户端 |
| POST | `/billing/meter-readings/import` | FINANCE, OPERATIONS 等 | Excel 导入抄表（multipart） |

**费项计费规则（`billingRule`）：** `FIXED` 固定金额、`BY_AREA` 按面积、`BY_METER` 按表读数

**账单状态：** `UNPAID` / `PARTIAL` / `PAID` / `OVERDUE`

**抄表导入：** 先调用 `GET /excel/meter-readings/template` 下载模板，再以 `multipart/form-data` 上传，字段：`file`、`projectId`、`feeItemId`、`periodStart`、`periodEnd`。

---

### 5.11 支付 `/payments`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/payments/orders` | 需登录 | 创建支付订单（Stub 预下单） |
| GET | `/payments/orders` | 需登录 | 支付订单列表 |
| GET | `/payments/orders/:id` | 需登录 | 订单详情 |
| POST | `/payments/notify` | 否 | 支付回调（Stub） |
| POST | `/payments/mock/success` | 否 | 模拟支付成功 |

**创建订单请求体：**

```json
{
  "renterAccountId": "uuid",
  "amount": 3500,
  "channel": "WECHAT",
  "description": "缴纳租金"
}
```

**支付渠道：** `WECHAT` / `ALIPAY` / `BANK`

**自动核销：** 支付成功后，系统按 `billDate` 升序自动匹配该租户未付清账单；超额部分记入 `overpayAmount` 与账户余额。

**开发测试流程：**

1. 租户登录获取 `renterAccountId`
2. `POST /payments/orders` 创建订单，获得 `orderNo`
3. `POST /payments/mock/success` 传入 `{ "orderNo": "..." }` 模拟支付成功

---

### 5.12 报修工单 `/repairs`

**状态流转：** `SUBMITTED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` → `RATED`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/repairs` | 全部 | 工单列表 |
| GET | `/repairs/:id` | 全部 | 工单详情 |
| POST | `/repairs` | TENANT | 提交报修 |
| PATCH | `/repairs/:id` | 租户/员工 | 修改/取消 |
| DELETE | `/repairs/:id` | 租户/员工 | 删除 |
| POST | `/repairs/:id/assign` | 客服/项目管理员 | 分配给工程人员 |
| POST | `/repairs/:id/progress` | ENGINEER | 更新进度 |
| POST | `/repairs/:id/complete` | ENGINEER | 标记完成 |
| GET | `/repairs/:id/messages` | 全部 | 沟通记录 |
| POST | `/repairs/:id/messages` | 全部 | 发送消息 |
| POST | `/repairs/:id/rating` | TENANT | 服务评价 |

---

### 5.13 投诉 `/complaints`

**状态流转：** `SUBMITTED` → `ANALYZING` → `APPEALING` → `CLOSED`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/complaints` | 全部 | 投诉列表 |
| GET | `/complaints/:id` | 全部 | 投诉详情 |
| POST | `/complaints` | TENANT | 租户提交投诉 |
| POST | `/complaints/:id/analysis` | OPERATIONS | 运营分析 |
| POST | `/complaints/:id/appeals` | 员工 | 提交申诉 |
| POST | `/complaints/:id/appeals/:appealId/resolve` | OPERATIONS | 处理申诉 |
| POST | `/complaints/:id/close` | OPERATIONS | 关闭投诉 |

---

### 5.14 公告与消息

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/announcements` | 全部 | 公告列表 |
| GET | `/announcements/:id` | 全部 | 公告详情 |
| POST | `/announcements` | 管理端 | 创建公告 |
| PATCH | `/announcements/:id` | 管理端 | 更新公告 |
| DELETE | `/announcements/:id` | 管理端 | 删除公告 |
| GET | `/notifications` | 需登录 | 我的消息 |
| PATCH | `/notifications/:id/read` | 需登录 | 标记已读 |
| PATCH | `/notifications/read` | 需登录 | 批量标记已读 |
| PATCH | `/notifications/read-all` | 需登录 | 全部已读 |

---

### 5.15 仪表盘 `/dashboard`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/dashboard/overview` | 管理端 | 运营概览（入住率、应收/实收、待处理工单等） |
| GET | `/dashboard/tenant-home` | TENANT | 租户首页（待缴费用、工单状态、公告） |

**概览查询参数：** `projectId`（可选，按项目过滤）

**概览返回字段：**

- `occupancyRate` 入住率
- `monthlyReceivable` / `monthlyCollected` 本月应收/实收
- `collectionRate` 收缴率
- `pendingRepairs` 待处理工单数
- `overdueBillsCount` 逾期账单数
- `expiringContractsCount` 30 天内到期合同数

---

### 5.16 报表 `/reports`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/reports/financial/rent-income` | 报表角色 | 租金收入报表 |
| GET | `/reports/financial/collection-rate` | 报表角色 | 收缴率报表 |
| GET | `/reports/financial/overdue-detail` | 报表角色 | 欠费明细 |
| GET | `/reports/operational/repair-analysis` | 报表角色 | 报修分析 |
| GET | `/reports/operational/satisfaction` | 报表角色 | 满意度报表 |

**通用查询参数：** `projectId`、`startDate`、`endDate`

**导出 Excel：** 追加 `export=true`，响应为 `.xlsx` 文件流。

---

### 5.17 文件 `/files`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/files/upload` | 需登录 | 单文件上传（multipart，字段 `file`） |
| POST | `/files/upload-multiple` | 需登录 | 多文件上传 |
| GET | `/files/:name` | 需登录 | 下载文件 |

上传成功返回文件访问路径/名称，可用于合同附件、报修图片等场景。

---

### 5.18 Excel `/excel`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/excel/meter-readings/template` | 需登录 | 下载抄表导入模板 |

---

### 5.19 系统 `/system`

| 方法 | 路径 | 角色 | 说明 |
|------|------|------|------|
| GET | `/system/audit-logs` | PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, OPERATIONS | 操作审计日志 |

**查询参数：** `module`、`action`、`page`、`pageSize`

---

## 6. 典型业务流程

### 6.1 合同审批

```
客服 POST /contracts          → 创建草稿
客服 POST /contracts/:id/submit
财务 POST /contracts/:id/finance/approve
管理员 POST /contracts/:id/admin/sign  → 合同生效
```

### 6.2 账单与缴费

```
财务 POST /billing/bills/generate   → 生成账单
财务 POST /billing/bills/publish    → 发布至租户端
租户 GET  /billing/bills            → 查看账单
租户 POST /payments/orders          → 发起支付
     POST /payments/mock/success    → （开发环境）模拟支付
系统自动核销账单并生成 PaymentRecord
```

### 6.3 报修闭环

```
租户 POST /repairs                  → 提交
客服 POST /repairs/:id/assign       → 分配工程人员
工程 POST /repairs/:id/progress     → 更新进度
工程 POST /repairs/:id/complete     → 完成
租户 POST /repairs/:id/rating       → 评价
```

### 6.4 投诉三方

```
租户 POST /complaints                      → 提交
运营 POST /complaints/:id/analysis         → 分析
员工 POST /complaints/:id/appeals          → 申诉（可选）
运营 POST /complaints/:id/appeals/:id/resolve
运营 POST /complaints/:id/close            → 关闭
```

---

## 7. 定时任务

| 任务 | 执行时间 | 说明 |
|------|----------|------|
| 月度账单生成 | 每月 1 日 02:00 | 按费项规则自动生成 |
| 合同到期预警 | 每天 08:00 | 到期前 30/15/7 天通知 |
| 逾期催缴 | 每天 09:00 | 标记 OVERDUE 并发送提醒 |

---

## 8. 第三方集成（Stub）

以下能力为桩实现，后续将替换：

| 能力 | 环境变量 | 说明 |
|------|----------|------|
| 支付 | `PAYMENT_PROVIDER=stub` | 返回 mock 预下单 ID |
| 短信 | `SMS_PROVIDER=stub` | 写入站内消息，不发送真实短信 |
| 微信 | `WECHAT_APPID` / `WECHAT_SECRET` | 使用 mock openid |
