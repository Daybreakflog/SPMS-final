# FINAL_FIX_REPORT — SPMS 审计修复总报告

> 范围：审计提出的 C-01 / C-02 / C-03 / C-04 / H-01 / H-03 六个高优问题。
> 产物：所有修改均已直接落到代码；附 5 份子报告与 1 份新发现说明。

## 修复项

### ✅ 已修复

| ID | 问题 | 修复方式 | 子报告 |
|----|------|----------|--------|
| C-01 | System Settings 假功能 | 删除所有 `Promise.resolve(DEFAULT_SETTING)`；改走真实 `http`；增加能力开关；不可用时显式提示 | `SETTINGS_FIX_REPORT.md` |
| C-02 | 17 个路由缺 RBAC | 顶部统一定义角色组，17 条裸路由全部补齐 `roleLoader`；菜单与路由 guard 强制同源 | `RBAC_FIX_REPORT.md` |
| C-04 | Session timeout 硬编码 | 抽出 `src/constants/session.ts`；支持环境变量与运行时覆盖；保留 TODO 等后端 | `SESSION_FIX_REPORT.md` |
| H-01 | 设置保存静默成功 | 所有 `useMutation` 增加 `onError`；按钮在 API 不可用时禁用；顶部展示 Alert | `SETTINGS_FIX_REPORT.md` |
| H-03 | 合同删除权限过宽 | `delete` 移除 CUSTOMER_SERVICE；`terminate` 收紧至公司 / 平台管理员 | `CONTRACT_PERMISSION_REPORT.md` |

### 🟨 部分修复

| ID | 问题 | 现状 |
|----|------|------|
| C-03 | MSW 漂移 | 已在每个含漂移端点的 handler 顶部插入 `⚠ MSW DRIFT MARKER` 注释；未做物理删除，原因：删除会立即破坏 UI 联调。详细清单见 `MSW_CLEANUP_REPORT.md` —— 后端落地接口后即可逐条移除。 |

### ❌ 无法修复（需后端配合）

- **后端 JWT/角色校验**：`roleLoader` 仅决定 UI 是否渲染，真正防越权需后端验证。前端已尽力闭合，后端必须同步加固。
- **15 个 Swagger 缺失接口**（含 system/settings 系列、dashboard 趋势 / 待办、notification 偏好、change-password、repair attachments、fee-analysis 报表等）必须由后端实现。

## 修改文件清单

```
src/api/request.ts                            修改：抽出常量；新增 setSessionTimeoutMs
src/constants/session.ts                      新增：会话超时常量
src/constants/status.ts                       修改：ContractActionRoles 收紧
src/router/index.tsx                          修改：17 个路由补 roleLoader
src/router/routes.config.ts                   修改：菜单 roles 与路由严格同源
src/services/setting.service.ts               重写：去掉 fake，走真实 http
src/pages/system/settings/index.tsx           修改：Alert + onError + disabled
src/types/api/audit.ts                        新增 AuditResourceHistoryParams
src/types/api/billing.ts                      BillListParams 增加 keyword
src/services/property.service.ts              移除未使用 Unit import
src/services/audit.service.ts                 ESLint: 重命名 _resourceId → void
src/services/project.service.ts               ESLint: 重命名 _id → void
src/services/__tests__/payment.service.test.ts  对齐 PaymentOrderListParams 字段
src/pages/billing/bills/index.tsx             移除未使用 Select import
src/pages/system/audit-logs/index.tsx         移除未使用 resultOptions
src/mocks/handlers/dashboard.ts               顶部 DRIFT MARKER
src/mocks/handlers/notification.ts            顶部 DRIFT MARKER
src/mocks/handlers/setting.ts                 顶部 DRIFT MARKER
src/mocks/handlers/audit.ts                   顶部 DRIFT MARKER
src/mocks/handlers/user.ts                    顶部 DRIFT MARKER
src/mocks/handlers/repair.ts                  顶部 DRIFT MARKER
src/mocks/handlers/report.ts                  顶部 DRIFT MARKER
```

## 自测结果

- `npm run build`：**通过**（Vite 构建产物正常生成；PWA precache 完成）
- TypeScript：`npx tsc -p tsconfig.app.json --noEmit` → **0 error**
- ESLint：`npx eslint .` → **0 error**；仅剩 6 条与本次任务无关的 `react-hooks/exhaustive-deps` 历史警告（位于 `NotificationCenter.tsx` 与 `dashboard/index.tsx`）

## 风险剩余项

1. **后端契约未对齐**：约 15 个 MSW 端点 Swagger 未定义；后端不实现则上线将整片功能 404。
2. **前端角色守卫不可替代后端**：所有 `roleLoader` 都是 UX 层，攻击者直接调 API 仍可越权。
3. **客户管理 / 房源页面角色范围保守**：当前未给 FINANCE 看 `customers/renters` 与 `properties/leases` 的能力；如业务确认财务也需查看，需要再放宽。
4. **System Settings 在生产环境默认禁用**：`VITE_SYSTEM_SETTINGS_ENABLED` 必须显式打开，否则平台管理员看到的是黄色 Alert + 灰按钮。

## 上线建议

| 阶段 | 动作 |
|------|------|
| 上线前 | 在测试环境验证：① 各角色登录后菜单可见性与可访问 URL 对齐；② 系统设置在未配置 env 时正确显示 Alert 且按钮 disabled；③ 终端控制台无新错误。 |
| 后端跟进 | 优先实现 `/api/system/settings` 4 接口（C-01 闭环），并补齐角色拦截；其次实现仪表盘 5 个聚合接口与通知 stats / preferences。 |
| 部署 | 生产环境如需启用系统设置，设置 `VITE_SYSTEM_SETTINGS_ENABLED=true`；如需自定义会话超时，设置 `VITE_SESSION_TIMEOUT_MINUTES=<分钟数>`。 |
| 观测 | 上线后监控 401 / 403 / 404 异常率，确认无前端因路由收紧而误伤的合法用户。 |
| 后续迭代 | 把 MSW 漂移端点逐条替换为真实接口；上线后从前端 MSW 中删除对应 handler，避免技术债再次堆积。 |

---

附录子报告：
- `RBAC_FIX_REPORT.md`
- `SETTINGS_FIX_REPORT.md`
- `MSW_CLEANUP_REPORT.md`
- `SESSION_FIX_REPORT.md`
- `CONTRACT_PERMISSION_REPORT.md`
- `NEW_CRITICAL_ISSUES.md`（如有）
