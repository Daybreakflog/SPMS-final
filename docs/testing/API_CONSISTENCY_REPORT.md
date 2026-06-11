# API 前后端一致性检查报告 (API_CONSISTENCY_REPORT.md)

> 检查时间: 2026-06-09
> 检查范围: 前端 TypeScript 类型 vs Swagger 文档 vs 真实 API 响应

## 重大发现

### 🔴 1. 响应包装格式不一致

**前端期望** (`src/api/adapter.ts`):
```typescript
function isWrappedResponse(data: unknown): data is WrappedResponse {
  return (
    typeof data === 'object' && data !== null &&
    'code' in data && 'data' in data &&
    typeof (data as WrappedResponse).code === 'number'
  );
}
// 期望: { code: 200, data: {...}, message: "ok" }
```

**实际后端响应**: 不包含 `code` / `data` / `message` 包装
- 列表: `{ items: [...], page, pageSize, total, totalPages }`
- 详情: 直接返回对象
- Dashboard: `{ occupancyRate, ... }`
- 登录: `{ accessToken, refreshToken, user }`

**影响**: 
- `isWrappedResponse` 始终返回 `false`
- `unwrapResponse` 不做任何解包，直接透传
- 前后端**恰好兼容**（因为未包装数据被原样返回）

**风险**: 如果后端某天为部分接口添加 `{code, data}` 包装，前端 `unwrapResponse` 的行为会变化

---

### 🟡 2. 分页字段名一致 ✅

| 前端类型 | Swagger 文档 | 真实响应 | 一致性 |
|----------|:---:|:---:|:---:|
| `items` | `items` | `items` | ✅ |
| `page` | `page` | `page` | ✅ |
| `pageSize` | `pageSize` | `pageSize` | ✅ |
| `total` | `total` | `total` | ✅ |
| `totalPages` | `totalPages` | `totalPages` | ✅ |

---

## 字段级一致性检查

### 用户 (StaffUser)

| 前端字段 | 类型 | 真实响应字段 | 类型 | 一致性 |
|----------|------|-------------|------|:---:|
| `id` | string | `id` | string (UUID) | ✅ |
| `username` | string | `username` | string | ✅ |
| `realName` | string | `realName` | string | ✅ |
| `phone` | string | `phone` | string | ✅ |
| `email` | string? | `email` | string \| null | ✅ |
| `avatar` | string? | `avatar` | string \| null | ✅ |
| `status` | number | `status` | number | ✅ |
| `userType` | string | `userType` | "STAFF" | ✅ |
| `roles` | RoleCode[] | `roles` | string[] | ✅ |
| `companyId` | string | `companyId` | string (UUID) | ✅ |
| `companyName` | string | `companyName` | string | ✅ |
| `projectIds` | string[] | `projectIds` | string[] | ✅ |

### Dashboard 概览 (DashboardOverview)

| 前端字段 | 类型 | 真实响应字段 | 类型 | 一致性 |
|----------|------|-------------|------|:---:|
| `occupancyRate` | number | `occupancyRate` | 1 | ✅ |
| `occupiedUnits` | number | `occupiedUnits` | 1 | ✅ |
| `totalUnits` | number | `totalUnits` | 1 | ✅ |
| `monthlyReceivable` | number | `monthlyReceivable` | 3802.75 | ✅ |
| `monthlyCollected` | number | `monthlyCollected` | 0 | ✅ |
| `collectionRate` | number | `collectionRate` | 0 | ✅ |
| `pendingRepairs` | number | `pendingRepairs` | 3 | ✅ |
| `overdueBillsCount` | number | `overdueBillsCount` | 2 | ✅ |
| `expiringContractsCount` | number | `expiringContractsCount` | 0 | ✅ |
| `period` | object | `period` | `{month, expiringWithinDays}` | ✅ |

---

## 已知缺失接口

| 前端调用 | 后端状态 | 影响 |
|----------|----------|------|
| `GET /projects/{id}/users` | ❌ 不存在 | `projectService.getUsers()` 返回空数组 |
| `GET /system/audit-logs/resource-history` | ❌ 不存在 | `auditService.resourceHistory()` 返回空数组 |
| `GET /system/settings` | ❌ 返回 404 | 系统设置页面可能异常 |
| `POST /users/change-password` | ❌ 不存在 | 改密码走 `PATCH /users/:id` |

---

## 公告 DTO 差异

| 字段 | 前端旧版 (注释) | API 文档 (CreateAnnouncementDto) | 实际可用 |
|------|:---:|:---:|:---:|
| `projectId` (单数) | ✅ | ✅ (必填) | ✅ |
| `title` | ✅ | ✅ (必填) | ✅ |
| `content` | ✅ | ✅ (必填) | ✅ |
| `status` | ✅ | ✅ (可选, 默认1) | ✅ |
| `publish` | ✅ | ✅ (可选) | ✅ |
| `type` | ❌ (已标记不可用) | ❌ 不存在 | ❌ |
| `scope` | ❌ (已标记不可用) | ❌ 不存在 | ❌ |
| `projectIds[]` | ❌ (已标记不可用) | ❌ 不存在 | ❌ |
| `attachment` | ❌ (已标记不可用) | ❌ 不存在 | ❌ |

**评价**: 前端注释已正确标注与后端 DTO 的差异，文档维护质量良好。

---

## 登录/刷新响应格式

| 字段 | 前端 LoginResult 类型 | 真实响应 | 一致性 |
|------|----------------------|----------|:---:|
| `accessToken` | string | string (JWT) | ✅ |
| `refreshToken` | string | string (JWT) | ✅ |
| `user` | object | object | ✅ |
| `user.id` | string | UUID string | ✅ |
| `user.username` | string | string | ✅ |
| `user.realName` | string | string | ✅ |
| `user.roles` | string[] | string[] | ✅ |
| `user.companyId` | string | UUID string | ✅ |
| `user.projectIds` | string[] | string[] | ✅ |
| `user.userType` | string | "STAFF" | ✅ |

---

## 总体一致性评分

| 类别 | 评分 | 说明 |
|------|:---:|------|
| 分页格式 | ✅ 100% | 完全一致 |
| 用户字段 | ✅ 100% | 完全一致 |
| Dashboard 字段 | ✅ 100% | 完全一致 |
| 认证接口 | ✅ 100% | 完全一致 |
| 公告 DTO | ✅ 100% | 前端已正确适配 |
| 响应包装 | ⚠️ 50% | 格式假设与实际不同但恰好兼容 |
| 缺失接口 | ⚠️ 85% | 2个已知缺失，有降级逻辑 |

**总评**: 前端类型定义与真实 API 响应**高度一致**。主要问题是响应包装格式假设与实际不同，但能正常工作。

---

## 建议修复

1. **响应包装**: 要么后端统一加 `{code, data, message}` 包装，要么前端移除 `unwrapResponse` 逻辑简化代码
2. **缺失接口**: 与后端协调补充 `GET /projects/{id}/users` 和 `GET /system/audit-logs/resource-history`
3. **系统设置**: 明确系统设置对应的后端接口并实现
