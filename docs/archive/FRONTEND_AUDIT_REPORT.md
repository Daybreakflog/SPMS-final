# 前端审计报告 FRONTEND_AUDIT_REPORT

> 审计时间：2026-06-10
> 审计对象：`property-admin`（React 19 + TS + Vite + Ant Design 6）
> 契约来源：`property-admin/智慧物业管理系统_API文档.md`（Swagger 导出）+ 真实后端 `https://www.cwuye.com/api`
> 原则：以 NestJS Controller 实际实现 / Swagger DTO 为准，前端向后端对齐。

## 总体结论

- `tsc -b --noEmit`：**0 error**。
- `eslint .`：**0 error / 6 warning**（均为 `react-hooks/exhaustive-deps`，非阻断）。
- Service 层（`src/services/*`）URL / Method / Path 参数 / 请求体与 API 文档**高度一致**，未发现 URL 拼写或方法错误。
- 主要问题集中在：**枚举值不一致**、**表单字段与后端 DTO 漂移**、**鉴权刷新 / 响应解包两处隐性逻辑风险**。

下列问题按风险从高到低排列。标注 `⚠需真实接口验证` 的项依赖后端真实响应结构，将在第三阶段确认。

---

## 文件：src/api/request.ts（Token 刷新逻辑）
### 问题
401 刷新分支使用**裸 `axios.post`** 调用 `/auth/refresh`，随后直接读取 `r.data.accessToken` / `r.data.refreshToken`（request.ts:127-138）。该调用**不经过** `request` 实例上的 `unwrapResponse` 响应拦截器。
而登录走的是 `http.post`（经过拦截器解包），`LoginPage` 直接使用 `result.accessToken`（login/index.tsx:22-24）。两条路径对"响应是否被包裹 `{code,data,message}`"的假设**不一致**：
- 若后端响应被包裹（登录能正常解包 → 说明后端确实包裹），则刷新分支拿到的是 `{code,data:{accessToken...}}`，`r.data.accessToken` 为 `undefined` → `setTokens(undefined, undefined)` → **Token 过期后自动刷新必然失败，用户被踢回登录页**。
- 若后端返回裸结构，则两者都正常。
### 原因
刷新请求为避免拦截器递归而绕过 `request` 实例，但同时也绕过了解包逻辑，未对包裹结构做兼容处理。
### 风险等级
**高**（`⚠需真实接口验证`：以 `/auth/staff/login` 与 `/auth/refresh` 的真实响应体确认是否包裹）
### 修复方案
让刷新结果与解包逻辑保持一致：读取时兼容两种结构，例如
`const body = r.data; const payload = body?.data ?? body; const { accessToken, refreshToken } = payload;`
或复用 `unwrapResponse` 后再取值。

---

## 文件：src/api/adapter.ts（响应解包条件）
### 问题
`unwrapResponse` 仅在**响应体内 `code === 200`** 时解包（adapter.ts:20）。而 API 文档中所有 `POST` 创建类接口标注返回 **`201`**（如创建公司、合同、报修、租户、账单等）。
若后端在 201 响应体里把 `code` 设为 `201`（而非恒为 200），则创建类响应**不会被解包**，调用方拿到的是整包 `{code,data,message}` 而非实体对象 → `create()` 返回值被错误使用（如读取 `newEntity.id` 得到 `undefined`）。
### 原因
解包条件硬编码为 `=== 200`，未覆盖 2xx / 业务码 0 等其它成功码。
### 风险等级
**高**（`⚠需真实接口验证`：抓一次真实 `POST /platform/companies` 201 响应体，确认其 `code` 字段值）
### 修复方案
将判定放宽为成功语义，例如 `code >= 200 && code < 300`（或后端约定的 `code === 0 / 200 / 201`）。若实测后端恒返回 `code:200`，则保持现状并在报告中记录。

---

## 文件：src/types/enums.ts + src/pages/service/complaints/index.tsx（投诉对象类型枚举）
### 问题
`ComplaintTargetType` 定义为 `STAFF / SERVICE / FACILITY`（enums.ts），但后端 `CreateComplaintDto.targetType` 实际取值为 **`PROJECT / STAFF / EVENT`**（API 文档 CreateComplaintDto）。
投诉列表筛选下拉框由 `ComplaintTargetTypeLabelKeys` 生成（complaints/index.tsx:108-110），因此：
- 下拉提供 `SERVICE / FACILITY` 两个**后端不存在**的取值 → 按其筛选恒为空结果；
- 缺失 `PROJECT / EVENT` 两个**真实存在**的取值 → 无法筛选；
- 列表/详情渲染用三元兜底（index.tsx:44、detail.tsx:158），`PROJECT/EVENT` 不会崩溃但**显示原始英文、无 i18n**。
### 原因
前端枚举与后端枚举值定义不同步（枚举值不一致）。
### 风险等级
**高**（功能性筛选失效 + 渲染未本地化）
### 修复方案
将 `ComplaintTargetType` 改为 `PROJECT / STAFF / EVENT`，同步更新 `constants/status.ts` 的 `ComplaintTargetTypeLabelKeys` 与 i18n 文案 key（`status.complaintTarget.*`）。

---

## 文件：src/services/user.service.ts + src/pages/profile/index.tsx（修改密码）
### 问题
个人中心收集 `oldPassword + newPassword`（profile/index.tsx:31-33），但 `userService.changePassword` 映射为 `PATCH /users/:id` 且仅提交 `{ password: newPassword }`（user.service.ts:62），**`oldPassword` 被静默丢弃，无旧密码校验**。
此外后端**无自助改密接口**（`types/api/user.ts` 注释已确认无 `POST /users/change-password`），`PATCH /users/:id` 属于用户管理域，普通角色（如 ENGINEER/TENANT）调用自己的 `/users/:id` 极可能命中 **RBAC 403**。
### 原因
后端缺自助改密端点，前端以用户管理端点近似替代，安全语义（旧密码校验）与权限边界不匹配。
### 风险等级
**高**（安全 + 普通用户改密可能 403 失败）
### 修复方案
短期：在个人中心隐藏旧密码无效校验的错觉，或后端补 `PATCH /users/me/password{ oldPassword,newPassword }`。在后端就绪前，于报告记录差异并保留 UI 但提示"需管理员"。`⚠需真实接口验证`：以普通角色实测 `PATCH /users/:id` 是否 403。

---

## 文件：src/pages/customers/renters/components/RenterFormDrawer.tsx + src/types/api/renter.ts（租户字段漂移）
### 问题
对照后端 `CreateRenterProfileDto`：
- 前端表单/DTO 含 `idFrontUrl`、`idBackUrl`（RenterFormDrawer.tsx:92-95；renter.ts），**后端 DTO 不存在这两个字段** → 上传的证件正反面 URL 被后端**静默丢弃，不落库**；
- 后端 DTO 含 `email` 字段，**前端表单/DTO 缺失** → 无法录入租户邮箱。
### 原因
前端 DTO 与表单字段未与后端 `CreateRenterProfileDto / UpdateRenterProfileDto` 对齐。
### 风险等级
**中**（证件影像无法保存，属隐性数据丢失）
### 修复方案
`⚠需真实接口验证`后端是否真不接收证件字段：
- 若确实不收：移除 `idFrontUrl/idBackUrl` 表单项与 DTO 字段（或推动后端补字段）；
- 补充 `email` 字段到 DTO 与表单。

---

## 文件：src/pages/service/repairs/index.tsx（报修类别筛选）
### 问题
报修列表"类别"筛选下拉由 `RepairTypeLabelKeys`（枚举 `ELECTRICAL/PLUMBING/DOOR_WINDOW/...`）生成（repairs/index.tsx:172-174）。而后端 `CreateRepairOrderDto.category` 文档描述为**自由中文文本**（"报修类别，如水电、空调、门窗等"）。
若后端实际存储中文/自由文本，则按枚举码筛选恒为空；列表/详情渲染已用三元兜底（index.tsx:88、detail.tsx:170），不会崩溃但可能显示原始值。
### 原因
`category` 在后端为自由字符串，前端按固定枚举建模，二者口径可能不一致。
### 风险等级
**中**（`⚠需真实接口验证`：拉一次真实 `GET /repairs` 看 `category` 实际取值）
### 修复方案
按实测：若后端用枚举码 → 现状正确，无需改；若为中文自由文本 → 改为后端返回值动态生成选项，或与后端统一为枚举码。

---

## 文件：src/pages/dashboard/index.tsx（仪表盘失效子模块）
### 问题
`trend / repairDist / todoList / latestNotice / expiringContracts` 五个子模块已被硬编码为 `undefined` 空数据（index.tsx:178-189），对应后端无 `trend / repair-distribution / todos / latest-announcements / expiring-contracts` 接口。
"收款趋势""报修分布"图表、"待办""最新公告""到期合同"列表将**永久显示为空**，但默认仍可见（`visibleModules` 默认全开），用户看到大量空白卡片。
### 原因
后端仅实现 `/dashboard/overview` 与 `/dashboard/tenant-home`，其余看板接口未实现，前端退化为空。
### 风险等级
**低**（非报错，纯 UX；代码注释已说明）
### 修复方案
后端补接口前，建议默认隐藏这些模块（`visibleModules` 默认 false）或显示"暂未开放"占位，避免空白卡片。

---

## 文件：src/services/project.service.ts、src/services/audit.service.ts（桩函数）
### 问题
- `projectService.getUsers(id)` 直接 `Promise.resolve([])`（后端无 `GET /projects/:id/users`）；
- `auditService.resourceHistory(resourceId)` 直接 `Promise.resolve([])`（后端无 `GET /system/audit-logs/resource-history`）。
任何依赖这两处的 UI（项目成员列表、资源变更历史）将恒为空。
### 原因
后端缺对应 GET 端点，前端以空数组桩占位。
### 风险等级
**低 / 信息**（已在代码注释标注 TODO(backend)）
### 修复方案
后端补端点后恢复真实请求；当前保持桩函数并在依赖处显示空态即可。

---

## 文件：src/services/setting.service.ts + src/pages/system/settings（系统设置）
### 问题
`/api/system/settings*` 后端未实现。`setting.service` 在生产环境直接 `throw`，仅 DEV/显式开关下可用（依赖 `VITE_SYSTEM_SETTINGS_ENABLED`）。系统设置页在生产为不可用状态。
同时 `request.ts:24-26` 注释提到登录后应调用 `setSessionTimeoutMs()` 写入后端 `security.sessionTimeout`，但该接口缺失 → 会话超时阈值恒为默认值。
### 原因
后端系统设置模块未实现。
### 风险等级
**低 / 信息**
### 修复方案
保持现状（已有显式开关 + 抛错避免假成功）。后端就绪后接入并在登录成功时回填会话超时。

---

## 文件：src/api/request.ts（403 整页跳转）
### 问题
任意请求返回 403 时执行 `window.location.href = '/403'`（request.ts:160-163），即使是页面中某个次要并发请求被拒，也会**整页跳走到 /403**，打断当前操作。
### 原因
全局拦截器对 403 一律硬跳转。
### 风险等级
**低**（UX）
### 修复方案
区分"路由级越权"与"局部接口越权"：局部 403 仅 toast 提示、不整页跳转；或对特定接口豁免跳转。

---

## 验证项清单（移交第三阶段 / 真实接口）

| 编号 | 验证内容 | 关联问题 |
|------|----------|----------|
| V1 | `/auth/staff/login`、`/auth/refresh` 真实响应是否包裹 `{code,data,message}`；`code` 取值 | request.ts 刷新、adapter |
| V2 | `POST` 创建类 201 响应体的 `code` 字段值（是否 200/201/0） | adapter 解包 |
| V3 | 分页响应是否为 `{items,total,page,pageSize,totalPages}`（`useTableQuery` 依赖 `items/total`） | 全部列表页 |
| V4 | `GET /repairs` 的 `category` 实际取值（枚举码 or 中文） | 报修类别筛选 |
| V5 | 投诉 `targetType` 真实取值是否为 `PROJECT/STAFF/EVENT` | 投诉枚举 |
| V6 | 普通角色 `PATCH /users/:id` 改密是否 403 | 修改密码 |
| V7 | 创建租户是否接收 `idFrontUrl/idBackUrl`、是否需要 `email` | 租户字段漂移 |

---

## 待第二阶段修复优先级建议

1. **P0**：投诉枚举值（确定性 Bug，可直接修）。
2. **P0/待验证**：Token 刷新解包、adapter 201 解包（V1/V2 确认后修，影响登录续期与创建流程）。
3. **P1**：修改密码语义与权限（V6 确认后修）。
4. **P1**：租户证件/邮箱字段漂移（V7 确认后修）。
5. **P2**：报修类别筛选（V4 确认后修）、仪表盘空模块默认隐藏、403 局部化。

> 本阶段仅审计，未改动任何代码。等待确认后进入第二阶段修复。
