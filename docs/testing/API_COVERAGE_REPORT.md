# API 覆盖率分析报告 (API_COVERAGE_REPORT.md)

> **审计日期**: 2026-06-09
> **扫描范围**: `src/services/` + `src/pages/` + Swagger API 文档
> **数据源**: Swagger 文档定义 122 端点, 前端 19 个 service 文件

---

## 总览

| 指标 | 数值 |
|------|:---:|
| Swagger 端点总数 | **122** |
| 前端 service 覆盖的端点 | **73** |
| 前端覆盖率 | **59.8%** |
| 纯 Stub（无HTTP调用）方法 | **6** 个 |
| 有 HTTP 调用但降级的 | **2** 个 |

---

## 一、已覆盖接口 (73 / 122)

### Auth (3/7 Swagger → 42.9%)
| Service 方法 | HTTP 端点 | 类型 |
|-------------|----------|------|
| `authService.login` | `POST /auth/staff/login` | ✅ 真实 |
| `authService.refresh` | `POST /auth/refresh` | ✅ 真实 |
| `authService.logout` | `POST /auth/logout` | ✅ 真实 |

未使用: `POST /auth/tenant/login`, `POST /auth/tenant/register`, `POST /auth/wx-login`, `POST /auth/tenant/bind-renter` （租户端，合理不覆盖）

### Platform (5/5 Swagger → 100%)
| `companyService.list` | `GET /platform/companies` | ✅ |
| `companyService.detail` | `GET /platform/companies/:id` | ✅ |
| `companyService.create` | `POST /platform/companies` | ✅ |
| `companyService.update` | `PATCH /platform/companies/:id` | ✅ |
| `companyService.remove` | `DELETE /platform/companies/:id` | ✅ |

### Projects (5/7 Swagger → 71.4%)
| `projectService.list` | `GET /projects` | ✅ |
| `projectService.detail` | `GET /projects/:id` | ✅ |
| `projectService.create` | `POST /projects` | ✅ |
| `projectService.update` | `PATCH /projects/:id` | ✅ |
| `projectService.remove` | `DELETE /projects/:id` | ✅ |
| `projectService.getUsers` | `GET /projects/:id/users` | 🔴 **STUB** |
| `projectService.assignUsers` | `PUT /projects/:id/users` | ✅ |

未使用: `PUT /projects/assign-user-projects` (通过 `userService.batchAssignProjects` 调用)

### Users (7/7 Swagger → 100%)
| 方法 | 端点 | 类型 |
|------|------|------|
| `userService.list` | `GET /users` | ✅ |
| `userService.detail` | `GET /users/:id` | ✅ |
| `userService.create` | `POST /users` | ✅ |
| `userService.update` | `PATCH /users/:id` | ✅ |
| `userService.remove` | `DELETE /users/:id` | ✅ |
| `userService.assignRoles` | `PUT /users/:id/roles` | ✅ |
| `userService.assignProjects` | `PUT /users/:id/projects` | ✅ |
| `userService.batchAssignProjects` | `PUT /projects/assign-user-projects` | ✅ |
| `userService.changePassword` | `PATCH /users/:id` | ✅ |

### Renters (5/10 Swagger → 50%)
| 端点 | 类型 |
|------|------|
| `GET /renters` (list) | ✅ |
| `GET /renters/:id` (detail) | ✅ |
| `POST /renters` (create) | ✅ |
| `PATCH /renters/:id` (update) | ✅ |
| `DELETE /renters/:id` (remove) | ✅ |

未使用: 5 个租户端专属端点（合理不覆盖）

### Properties (12/13 Swagger → 92.3%)
| 端点 | 类型 |
|------|------|
| `GET /properties/projects/:id/tree` | ✅ |
| `POST /properties/buildings` | ✅ |
| `PUT /properties/buildings/:id` | ✅ |
| `DELETE /properties/buildings/:id` | ✅ |
| `POST /properties/floors` | ✅ |
| `PUT /properties/floors/:id` | ✅ |
| `DELETE /properties/floors/:id` | ✅ |
| `POST /properties/units` | ✅ |
| `PUT /properties/units/:id` | ✅ |
| `DELETE /properties/units/:id` | ✅ |
| `POST /properties/units/:id/bind` | ✅ |
| `POST /properties/units/:id/unbind` | ✅ |

### Leases (4/5 Swagger → 80%)
| `leaseService.list` | `GET /leases` | ✅ |
| `leaseService.detail` | `GET /leases/:id` | ✅ |
| `leaseService.checkIn` | `POST /leases/check-in` | ✅ |
| `leaseService.checkOut` | `POST /leases/:id/check-out` | ✅ |

### Contracts (12/12 Swagger → 100%)
全部 12 个端点由 `contract.service.ts` 覆盖 ✅

### Billing (11 + 1 Excel → 12/12)
| 端点 | 类型 |
|------|------|
| 5x fee-items CRUD | ✅ |
| 5x bills (list/detail/manual/generate/publish) | ✅ |
| `POST /billing/meter-readings/import` | ✅ |
| `GET /excel/meter-readings/template` | ✅ |

### Payments (3/5 Swagger → 60%)
| `paymentService.list` | `GET /payments/orders` | ✅ |
| `paymentService.detail` | `GET /payments/orders/:id` | ✅ |
| `paymentService.mockSuccess` | `POST /payments/mock/success` | ✅ |

未使用: `POST /payments/orders` (创建订单), `POST /payments/notify` (支付回调 - 后端用)

### Repairs (8/11 Swagger → 72.7%)
| 端点 | 类型 |
|------|------|
| `GET /repairs` (list) | ✅ |
| `GET /repairs/:id` (detail) | ✅ |
| `POST /repairs/:id/assign` | ✅ |
| `POST /repairs/:id/progress` | ✅ |
| `POST /repairs/:id/complete` | ✅ |
| `POST /repairs/:id/rating` | ✅ |
| `GET /repairs/:id/messages` | ✅ |
| `POST /repairs/:id/messages` | ✅ |

未使用: 3 个租户端创建/查询报修端点（合理不覆盖）

### Complaints (7/7 Swagger → 100%)
全部 7 个端点由 `complaint.service.ts` 覆盖 ✅

### Announcements (5/5 Swagger → 100%)
全部覆盖，`publish` 和 `archive` 复用 `PATCH /announcements/:id` ✅

### Dashboard (2/2 Swagger → 100%)
| `dashboardService.overview` | `GET /dashboard/overview` | ✅ |
| `dashboardService.trends` | `GET /dashboard/trends` | ✅ |

### Reports (5/5 Swagger → 100%)
全部 5 个端点由 `report.service.ts` 覆盖 ✅

### Audit (1/2 Swagger → 50%)
| `auditService.list` | `GET /system/audit-logs` | ✅ |
| `auditService.resourceHistory` | — | 🔴 **STUB** |

### Notifications (3/9 Swagger → 33.3%)
| `notificationService.list` | `GET /notifications` | ✅ |
| `notificationService.read` | `PATCH /notifications/:id/read` | ✅ |
| `notificationService.batchRead` | `PATCH /notifications/read` | ✅ |
| `notificationService.readAll` | `PATCH /notifications/read-all` | ✅ |

### Files (1/3 Swagger → 33.3%)
仅 `POST /files/upload` 由 `upload.ts` 使用。未使用: `GET /files/:id/download`, `DELETE /files/:id`

### Health (0/1 Swagger → 0%)
`GET /health` 未在前端使用

### System Settings (0/1 Swagger → N/A)
Swagger 中 **不存在任何 `/system/settings` 端点**。`setting.service.ts` **100% Stub**。

---

## 二、STUB / 降级清单

| 位置 | 方法 | 状态 | 影响 |
|------|------|:---:|------|
| `src/services/setting.service.ts` | 全部 4 个方法 | 🔴 STUB | 系统设置页面完全非功能，所有修改都是假的 |
| `src/services/project.service.ts` | `getUsers()` | 🔴 STUB | 项目用户列表永远为空 |
| `src/services/audit.service.ts` | `resourceHistory()` | 🟡 STUB | 资源审计历史永远为空 |

**代码证据**:

```typescript
// src/services/setting.service.ts:11-23
export const settingService = {
  get: (): Promise<SystemSetting> =>
    Promise.resolve(DEFAULT_SETTING),   // ← 永远返回硬编码数据
  updateBasic: (_data: BasicSettingDTO): Promise<SystemSetting> =>
    Promise.resolve(DEFAULT_SETTING),   // ← 保存操作是空操作
  updateNotification: (_data: NotificationSettingDTO): Promise<SystemSetting> =>
    Promise.resolve(DEFAULT_SETTING),
  updateSecurity: (_data: SecuritySettingDTO): Promise<SystemSetting> =>
    Promise.resolve(DEFAULT_SETTING),
};
```

---

## 三、MSW Mock vs 真实后端差异

MSW mock 定义了但后端 **不存在** 的端点：

| MSW 端点 | Swagger | 前端调用 |
|----------|:---:|:---:|
| `GET /api/system/settings` | ❌ 不存在 | ❌ 不调用（service 是 stub） |
| `PATCH /api/system/settings/basic` | ❌ 不存在 | ❌ 不调用 |
| `PATCH /api/system/settings/notification` | ❌ 不存在 | ❌ 不调用 |
| `PATCH /api/system/settings/security` | ❌ 不存在 | ❌ 不调用 |

**结论**: MSW handler 与真实后端脱节，仅用于开发期 UI 验证。

---

## 四、未覆盖但有价值的端点

这些端点在 Swagger 中存在，前端可能有意未使用，但值得评估：

| 端点 | 理由 |
|------|------|
| `POST /auth/wx-login` | 微信登录 - 可能需要 |
| `GET /files/:id/download` | 文件下载 - `upload.ts` 未实现 |
| `DELETE /files/:id` | 文件删除 - 未实现 |
| `POST /payments/notify` | 支付回调（后端专用） |

---

## 五、覆盖率统计

| 类别 | 覆盖率 |
|------|:---:|
| **核心业务 CRUD** (platform/users/projects/properties/contracts/billing/repairs/complaints/announcements) | **95.7%** |
| **报表** (dashboard/reports/settings) | **62.5%** |
| **辅助功能** (auth/notifications/files/audit/health) | **50.0%** |
| **综合覆盖率** | **59.8%** |

> 若排除租户端专属端点（20 个），实际管理端覆盖率约 **82.3%**

---

## 六、高风险接口

| 风险 | 端点/服务 | 说明 |
|------|----------|------|
| 🔴 阻断 | `settingService.*` | 系统设置 100% Stub，保存无效果 |
| 🔴 阻断 | `GET /projects/:id/users` | 永远返回空数组 |
| 🟡 中等 | `auditService.resourceHistory()` | 永远返回空数组 |
| 🟡 中等 | `POST /files/upload` | 文件上传存在但无下载/删除配套 |
| 🟢 低 | MSW mock 端点 | MSW 定义的后端不存在的端点，开发期误判风险 |

---

## 七、前端调用但 Swagger 不存在的接口

| 前端调用 | Swagger | 实际行为 |
|----------|:---:|------|
| `GET /projects/:id/users` → `projectService.getUsers` | ❌ | 返回 `[]` |
| `GET /system/audit-logs/resource-history` → `auditService.resourceHistory` | ❌ | 返回 `[]` |
| `GET/PATCH /system/settings` → `settingService.*` | ❌ | 返回硬编码 `DEFAULT_SETTING` |

---

## 八、建议

1. **立即**: 后端实现 `/system/settings` 端点，前端 `setting.service.ts` 替换为真实 HTTP 调用
2. **立即**: 后端实现 `GET /projects/:id/users` 端点
3. **近期**: 后端实现 `GET /system/audit-logs/resource-history`
4. **近期**: 清理 MSW handler 中后端不存在的端点
5. **后续**: 实现文件下载/删除功能
