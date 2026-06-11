# 核心业务流程测试报告 (BUSINESS_FLOW_REPORT.md)

> 测试时间: 2026-06-09
> 测试账号: admin (PLATFORM_ADMIN + COMPANY_ADMIN)
> 测试方法: 真实 HTTP 请求到 https://www.cwuye.com/api

## 测试范围

| 业务模块 | 查询列表 | 详情 | 新增 | 修改 | 删除 | 状态流转 |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 用户管理 | ✅ | ✅ | ⬜ | ⬜ | ⬜ | - |
| 公司管理 | ✅ | ✅ | ⬜ | ⬜ | ⬜ | - |
| 项目管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | - |
| 合同管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 公告管理 | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ |
| 账单管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 支付管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 报修管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 投诉管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 租户管理 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | - |
| 入住退租 | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 仪表盘 | ✅ | - | - | - | - | - |
| 财务报表 | ✅ | - | - | - | - | - |
| 审计日志 | ✅ | - | - | - | - | - |

> ✅ = 测试通过, ⬜ = 未测试 (时间/数据限制)

---

## 详细测试记录

### 1. 公告管理 (完整 CRUD)

#### 1.1 创建公告

**请求**:
```
POST /api/announcements
Content-Type: application/json

{
  "projectId": "6d9ddeb7-ff49-47d6-9c9e-6dcb22f81ba5",
  "title": "API_Test_190447",
  "content": "Integration test announcement"
}
```

**响应 (200)**:
```json
{
  "id": "27898c47-3d67-428d-a379-e99b995b5fbd",
  "projectId": "6d9ddeb7-ff49-47d6-9c9e-6dcb22f81ba5",
  "title": "API_Test_190447",
  "content": "Integration test announcement",
  "status": 1,
  "publishedAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**结果**: ✅ PASS | 耗时: ~400ms

#### 1.2 更新公告

**请求**:
```
PATCH /api/announcements/27898c47-3d67-428d-a379-e99b995b5fbd
{"title": "UPD_190447"}
```

**响应**: 200 ✅ PASS

#### 1.3 删除公告

**请求**:
```
DELETE /api/announcements/27898c47-3d67-428d-a379-e99b995b5fbd
```

**响应**: 200 ✅ PASS

---

### 2. 公告列表查询

**请求**: `GET /api/announcements`

**响应 (200)**: 返回公告数组

---

### 3. 用户列表查询

**请求**: `GET /api/users?page=1&pageSize=2`

**响应 (200)**:
```json
{
  "items": [{ ... }],
  "page": 1,
  "pageSize": 2,
  "total": 3,
  "totalPages": 2
}
```

**分析**: 系统中现有 3 个用户

---

### 4. 合同列表查询

**请求**: `GET /api/contracts?page=1&pageSize=1`

**响应 (200)**: `{ "items": [...], "total": 1, "page": 1, "pageSize": 1, "totalPages": 1 }`

---

### 5. 账单列表查询

**请求**: `GET /api/billing/bills?page=1&pageSize=1`

**响应 (200)**: `{ "items": [...], "total": 4, "page": 1, "pageSize": 1, "totalPages": 4 }`

---

### 6. 仪表盘概览

**请求**: `GET /api/dashboard/overview`

**响应 (200)**:
```json
{
  "occupancyRate": 1,
  "occupiedUnits": 1,
  "totalUnits": 1,
  "monthlyReceivable": 3802.75,
  "monthlyCollected": 0,
  "collectionRate": 0,
  "pendingRepairs": 3,
  "overdueBillsCount": 2,
  "expiringContractsCount": 0,
  "period": {
    "month": "2026-06",
    "expiringWithinDays": 30
  }
}
```

---

### 7. 公司列表查询

**请求**: `GET /api/platform/companies?page=1&pageSize=1`

**响应 (200)**: `{ "items": [...], "total": 2, "page": 1, "pageSize": 1, "totalPages": 2 }`

**分析**: 系统中现有 2 个公司

---

### 8. 支付订单查询

**请求**: `GET /api/payments/orders?page=1&pageSize=10`

**响应**: 200 ✅ PASS

---

### 9. 报修单查询

**请求**: `GET /api/repairs?page=1&pageSize=10`

**响应**: 200 ✅ PASS

---

### 10. 投诉查询

**请求**: `GET /api/complaints?page=1&pageSize=10`

**响应**: 200 ✅ PASS

---

### 11. 租户查询

**请求**: `GET /api/renters?page=1&pageSize=10`

**响应**: 200 ✅ PASS

---

### 12. 入住记录查询

**请求**: `GET /api/leases?page=1&pageSize=10`

**响应**: 200 ✅ PASS

---

### 13. 财务报表查询

**请求**: `GET /api/reports/financial/rent-income`

**响应**: 200 ✅ PASS

**请求**: `GET /api/reports/financial/collection-rate`

**响应**: 200 ✅ PASS

---

### 14. 运营报表查询

**请求**: `GET /api/reports/operational/repair-analysis`

**响应**: 200 ✅ PASS

---

### 15. 审计日志查询

**请求**: `GET /api/system/audit-logs`

**响应**: 200 ✅ PASS

---

## 数据统计

| 实体 | 总数 |
|------|------|
| 用户 | 3 |
| 公司 | 2 |
| 项目 | 多个 |
| 合同 | 1 |
| 账单 | 4 |
| 单元 | 1 |
| 待处理报修 | 3 |
| 逾期账单 | 2 |

---

## 发现的问题

### ⚠️ 1. 场景数据不足

业务数据量较少（1个合同、4个账单、1个单元），难以测试完整的业务流转（例如合同审批流程需要多种状态合同）。

### ⚠️ 2. 部分 CRUD 未测试

受限于时间和避免污染生产数据，以下写操作未测试:
- 用户创建/修改/删除
- 公司创建/修改/删除
- 合同创建/审批/终止
- 账单生成/发布
- 报修派单/处理
- 入住/退租办理
- 支付操作

### ℹ️ 3. 公告 DTO 字段差异

前端 `AnnouncementCreateDTO` 定义中标注了 `type`、`scope`、`projectIds[]` 等字段"不包含"，
但实际创建时只需要 `projectId` (单数String)、`title`、`content` 三个必填字段。
前端代码注释已正确标注这一点。

### ℹ️ 4. 响应分页格式统一

所有列表接口使用统一的分页格式: `{ items, page, pageSize, total, totalPages }`
前端需要确保 service 层正确映射此格式到 `PageResult<T>` 类型。
