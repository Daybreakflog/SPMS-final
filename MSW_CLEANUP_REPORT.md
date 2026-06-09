# MSW_CLEANUP_REPORT — MSW 漂移清理报告

## 背景

审计项 **C-03**：MSW Mock 与 Swagger 1.0 后端契约不一致，存在前端用 Mock 跑通、上线必崩的风险。

> 注：保留 Mock 而不直接删除，是因为多处前端页面已经调用这些端点。如直接删除，开发环境会立即 404 影响联调。本次方案选择"显式标记 + 报告归档 + 后端落地后再回退"。

## 修改文件

为每个含漂移端点的 handler 文件顶部添加 **`⚠ MSW DRIFT MARKER`** 注释，列出与 Swagger 不符的端点：

| 文件 | 漂移端点数量 |
|---|---|
| `src/mocks/handlers/dashboard.ts` | 5 |
| `src/mocks/handlers/notification.ts` | 8 |
| `src/mocks/handlers/setting.ts` | 4 |
| `src/mocks/handlers/audit.ts` | 1 |
| `src/mocks/handlers/user.ts` | 1 |
| `src/mocks/handlers/repair.ts` | 1 |
| `src/mocks/handlers/report.ts` | 1 |

## 分类清单

### 删除（建议）

> 本次未执行物理删除（页面尚在引用）。下列端点应**与后端确认后从 MSW 移除**或被新的真实接口替换：

- `GET  /api/notification/list`（重复：与 `/api/notifications` 冗余）
- `PUT  /api/notification/:id/read`（重复：与 `PATCH /api/notifications/:id/read` 冗余）
- `PUT  /api/notification/read-all`（重复：与 `PATCH /api/notifications/read-all` 冗余）

### 保留（已与 Swagger 对齐）

下列端点 MSW 与 Swagger 1.0 完全匹配，正常使用即可：

- 认证：`POST /api/auth/staff/login`、`POST /api/auth/refresh`、`POST /api/auth/logout`
- 公司 / 项目 / 用户 / 租户 / 房源 / 入住 / 合同 / 账单 / 费项 / 支付订单 / 文件上传：路径、HTTP 方法均与 Swagger 一致
- 仪表盘核心：`GET /api/dashboard/overview`、`GET /api/dashboard/tenant-home`
- 报修 / 投诉 / 公告主流程接口
- 报表（除 `fee-analysis` 外）
- 审计日志列表 `GET /api/system/audit-logs`

### 待后端实现（前端依赖中，但 Swagger 未定义）

| 端点 | 业务用途 |
|---|---|
| `GET    /api/dashboard/trend` | 仪表盘趋势图 |
| `GET    /api/dashboard/repair-distribution` | 工单分布 |
| `GET    /api/dashboard/todos` | 待办事项 |
| `GET    /api/dashboard/expiring-contracts` | 即将到期合同 |
| `GET    /api/dashboard/latest-announcements` | 仪表盘公告轮播 |
| `GET    /api/notification/stats` | 通知统计 |
| `POST   /api/notification/batch-delete` | 通知批量删除 |
| `DELETE /api/notification/:id` | 单条通知删除 |
| `GET    /api/notification/preferences` | 通知偏好设置 |
| `PUT    /api/notification/preferences` | 保存通知偏好 |
| `GET    /api/system/audit-logs/resource-history` | 资源历史 |
| `POST   /api/users/change-password` | 用户改密 |
| `PATCH  /api/repairs/:id/attachments` | 报修附件追加 |
| `GET    /api/reports/financial/fee-analysis` | 费项分析报表 |
| `GET    /api/system/settings` 系列 | 系统设置（C-01 已单独处理） |

## 后续

- 后端补齐上表后，**先在 Swagger 注册，再删除对应 MSW**。
- 在新增任何 MSW handler 时，务必先确认 Swagger 已有对应路径，避免再次漂移。
