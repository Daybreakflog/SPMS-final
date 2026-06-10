# 前端修复报告 FIX_REPORT

> 修复时间：2026-06-10
> 项目：`property-admin`
> 验证方式：**真实接口**（`https://www.cwuye.com/api`，账号 admin/admin123），未使用 MSW / Mock。
> 校验结果：`tsc -b --noEmit` **0 error**；`eslint .` **0 error**（6 个既有 hooks 警告，与本次无关）。

---

## 一、真实接口验证发现（修正第一阶段误报）

第一阶段审计中标注"需真实接口验证"的几项，经真实抓包**全部证伪**，避免了错误修改：

| 项 | 审计推测 | 真实结论 |
|----|----------|----------|
| 响应包裹 `{code,data,message}` | 可能包裹导致解包失败 | **后端返回原始结构**（登录/刷新/列表/创建均无包裹），`adapter` 与刷新逻辑均正常，非 bug |
| `adapter` 仅 `code===200` 解包 | 201 创建可能不解包 | 创建 201 直接返回实体，无包裹，非 bug |
| 分页结构 | 可能非 `{items,total}` | 真实即 `{items,total,page,pageSize,totalPages}`，非 bug |
| 报修 `category` | 可能为中文自由文本 | 真实为枚举码（如 `OTHER`），现有枚举筛选正确，非 bug |
| Token 刷新 | 裸 axios 读 `r.data.accessToken` 可能失败 | 真实返回原始 `{accessToken,...}`，正常工作，非 bug |

**真实接口反而暴露出更严重的契约漂移**（下述），这些才是本次实际修复重点。

---

## 二、修复文件

### 1. 用户管理：嵌套角色/项目解析（最高优先级，原会崩溃）
**文件名**：
- `src/services/user.service.ts`
- `src/types/domain/user.ts`
- `src/types/api/user.ts`
- `src/pages/org/users/index.tsx`
- `src/pages/org/users/detail.tsx`

**修改内容**：
- 真实 `/users`、`/users/:id` 返回 `roles: [{ roleId, role:{ name,label } }]`、`projects: [{ projectId, project:{} }]`，**无 `projectIds`、无 `companyName`**；而登录接口返回扁平 `roles:["..."]`、`projectIds:[]`、`companyName`。
- 重写 `normalizeRoles`：新增对嵌套 `role.name` 的提取（原逻辑只读顶层 `role/code/name`，对真实数据返回空 → 角色列全空）。
- 重写 `normalizeProjectIds`：兼容 `projectId` / 嵌套 `project.id`，并对 `undefined` 安全（原 `projectIds.map` 在真实数据下 `user.projectIds` 为 `undefined` → **编辑/详情打开即崩溃**）。
- `normalizeUser`：从 `projectIds ?? projects` 取项目、从 `companyName ?? company.name` 取公司名。
- `StaffUser.status` 由 `string` 改为 `number`（1/0），补 `email/avatar/company/projects` 关联字段；`UserListParams.status` 改 `number`。
- 列表/详情状态渲染 `=== 'ACTIVE'` → `=== 1`；状态筛选下拉 `value="ACTIVE"/"DISABLED"` → `value={1}/{0}`（真实接口 `?status=ACTIVE` 被拒，`?status=1/0` 正确）。

### 2. 物业公司：数字状态 + `_count` 计数
**文件名**：
- `src/types/domain/company.ts`
- `src/types/api/company.ts`
- `src/pages/platform/companies/index.tsx`
- `src/pages/platform/companies/detail.tsx`

**修改内容**：
- `Company.status` `'ACTIVE'|'DISABLED'` → `number`；新增 `_count:{projects,users}`（真实字段），`projectCount/staffCount` 降级为可选兼容字段。
- 列表/详情状态渲染与筛选改数字（同上）。
- "项目数/员工数"列与详情改为读取 `_count.projects / _count.users`（原 `projectCount/staffCount` 后端不返回 → 原显示空）。

### 3. 费项：数字状态
**文件名**：
- `src/types/domain/billing.ts`
- `src/types/api/billing.ts`
- `src/pages/billing/fee-items/index.tsx`
- `src/pages/billing/fee-items/components/FeeItemFormDrawer.tsx`

**修改内容**：
- `FeeItem.status` → `number`；`FeeItemListParams.status` → `number`。
- 列表状态渲染由 `StatusTag status={v}` 改为 `v===1 ? ACTIVE : DISABLED` 再查 Meta（保留 i18n）。
- 编辑表单 `enabled: feeItem.status === 'ACTIVE'` → `=== 1`（原对数字恒为 false → 编辑启用项时开关错误地显示为禁用）。
- 状态筛选下拉改数字值。

### 4. 项目：编辑表单状态初始化
**文件名**：`src/pages/org/projects/components/ProjectFormDrawer.tsx`

**修改内容**：`status: editingProject.status === 'DISABLED' ? 0 : 1` → 复用 `isProjectActive()`。原逻辑对数字 `0`（禁用）判断为 false → 禁用项目在编辑框里错误地回显为"启用"。

### 5. 租户账号状态 + 缺失 email 字段
**文件名**：
- `src/pages/customers/renters/detail.tsx`
- `src/pages/customers/renters/components/RenterFormDrawer.tsx`
- `src/types/api/renter.ts`
- `src/types/domain/renter.ts`

**修改内容**：
- 租户账号状态渲染 `=== 'ACTIVE'` → `=== 1`（`RenterAccount.status` 为数字，原恒显示"已禁用"）。
- 表单新增"邮箱"字段并加邮箱校验；`RenterCreateDTO`/`Renter` 补 `email`（后端 `CreateRenterProfileDto` 支持 `email`，原前端未采集）。

### 6. 投诉对象类型枚举不一致
**文件名**：
- `src/types/enums.ts`
- `src/constants/status.ts`
- `src/locales/zh-CN.json`
- `src/locales/en-US.json`

**修改内容**：`ComplaintTargetType` 由 `STAFF/SERVICE/FACILITY` 改为后端真实的 `PROJECT/STAFF/EVENT`，同步标签映射与中英文案。原投诉列表筛选下拉提供后端不存在的 `SERVICE/FACILITY`（筛选恒空），且缺失 `PROJECT/EVENT`。

**修改文件总计：22 个**

---

## 三、真实接口端到端验证（第三阶段）

| 场景 | 接口 | 结果 |
|------|------|------|
| 登录 | `POST /auth/staff/login` | ✅ 原始结构 `{accessToken,refreshToken,user}` |
| Token 刷新 | `POST /auth/refresh` | ✅ 返回 `{accessToken,refreshToken,user}`，刷新逻辑正常 |
| 列表查询/分页 | `GET /users`、`/platform/companies?page&pageSize` | ✅ `{items,total,page,pageSize,totalPages}` |
| 搜索/筛选 | `?status=1`/`?status=0` | ✅ 数字状态过滤生效；`?status=ACTIVE` 被后端拒绝（印证修复必要） |
| 新增 | `POST /platform/companies` | ✅ 201 直接返回实体，`status:1` |
| 编辑 | `PATCH /platform/companies/:id` | ✅ 返回更新后实体 |
| 删除 | `DELETE /platform/companies/:id` | ✅ HTTP 200，列表确认已删除（测试数据已清理） |
| RBAC | 角色取自 JWT，`roles/projectIds` 多角色解析 | ✅ admin 多角色 `[PLATFORM_ADMIN,COMPANY_ADMIN]` 正确解析 |

> 验证产生的临时公司 `__ZZ_AUDIT_TEST__` 已删除，未在真实环境残留数据。

---

## 四、API 文档 vs 后端实现差异记录

以 NestJS 后端真实响应为准，文档（Swagger 导出）未覆盖响应 schema 的部分如下：

1. **统一响应未包裹**：后端直接返回业务实体/分页对象，无 `{code,data,message}` 外层。前端 `adapter.ts` 的解包是防御性兼容，对当前后端为空操作。
2. **状态字段为数字**：`company/user/project/renterProfile/feeItem` 的 `status` 均为 `number`（1 启用 / 0 禁用），文档未标明类型；筛选参数也必须传数字。
3. **关联以嵌套对象返回**：`/users` 的 `roles` 为 `[{role:{name,label}}]`、`projects` 为 `[{projectId,project:{}}]`，**无** `projectIds`/`companyName` 扁平字段。
4. **公司计数**：列表用 `_count:{projects,users}`，非 `projectCount/staffCount`。
5. **报修 `category`**：真实使用枚举码（如 `OTHER`），文档描述中的"水电/空调"仅为示例文字。
6. **投诉 `targetType`**：文档 DTO 正确（`PROJECT/STAFF/EVENT`），前端枚举此前定义错误，已对齐。

---

## 四点五、MSW 与测试 fixture 对齐（追加）

> 背景：MSW 在所有环境均关闭（`VITE_ENABLE_MSW=false`），属遗留 mock；为防止假数据继续误导后续开发，将其与测试 fixture 同步为真实后端形态。

**MSW handlers**（`src/mocks/handlers/`）：
- `company.ts`：`status` 字符串→数字（1/0）、`projectCount/staffCount`→`_count:{projects,users}`、列表 status 过滤改 `Number(status)`。
- `user.ts`：`status` 字符串→数字、status 过滤改 `Number(status)`（roles 真实为嵌套，但页面 `normalizeRoles` 已兼容扁平/嵌套两形态，故保留扁平不影响）。
- `billing.ts`（费项）、`renter.ts`（租户账号）：`status` 字符串→数字（含类型注解与创建默认值）。
- `complaint.ts`：`targetType` 取值 `STAFF/SERVICE/FACILITY`→`PROJECT/STAFF/EVENT`。

**测试 fixture**（`src/pages/__tests__/`、`src/services/__tests__/`）：
- `UserList`、`UserDetailPage`、`UserDetailAudit`、`CompanyDetailPage`：fixture 改为真实形态（嵌套 `roles:[{role:{name}}]`、嵌套 `projects`、`company:{name}`、数字 `status`、公司 `_count`）；并修复其 `vi.mock` 漏导出 `normalizeRoles/normalizeUser` 导致整页渲染崩溃的**既有 bug**（改用 `importActual` 保留真实 normalize）。
- `ComplaintList`：fixture `targetType` `FACILITY`→`EVENT`。
- `company.endpoints.probe.test.ts`（MSW 契约探针）：断言 `status` 由 `'ACTIVE'/'DISABLED'` 改为 `1/0`。

**测试结果**：基线 52 失败 / 434 通过 → 现 **36 失败 / 450 通过**（净修复 16，**0 回归**）。`tsc` 0 error、`eslint` 0 error 保持。

剩余 36 个失败分布在 13 个文件，经基线对比确认**全部为既有失败、与本次数据形态无关**，包括：
- 测试内权限：列表"编辑"按钮被 `PermissionGuard` 拦截（测试未注入登录态）——`CompanyList` 等。
- i18n 标题在测试环境未解析（`t('service.complaintTitle')`）——`ComplaintList` 等。
- service 调用签名/桩行为断言——`contract.service`（submit 空体）、`project.service`/`audit.service`（getUsers/resourceHistory 桩）。
- 后端缺失功能页——`Dashboard`/`DataScreen`/`SystemSettingsPage`。

这些属测试基建/既有问题，不在"对齐真实后端形态"范围内，建议另行专项处理（见风险项）。

---

## 四点六、清零既有测试失败（追加）

> 在对齐 MSW/fixture 后，继续将基线遗留的全部失败测试修复至**全绿**。

**测试结果：36 失败 / 450 通过 → 0 失败 / 486 通过（73 文件全部通过）**。`tsc` 0 error、`eslint` 0 error 保持。

按根因分类的修复：
- **mock 漏导出导致整页崩溃**（与真实 normalize/服务相关的既有 bug）：`UserList`/`UserDetailPage`/`UserDetailAudit`/`CompanyDetailPage` 改用 `importActual` 保留 `normalizeRoles/normalizeUser`；`SystemSettingsPage` 补 `isSystemSettingsApiEnabled` 导出。
- **页面顶层 PermissionGuard 未注入登录态**（整页"暂无权限"/按钮隐藏）：`CompanyList`/`ComplaintList`/`DataScreen` 在 `beforeEach` 注入登录用户（`DataScreen` 用财务可见 KPI）。
- **service 测试断言过时**（服务已对齐真实后端）：`contract.submit` 改断言带空 body；`project.getUsers`/`audit.resourceHistory` 改断言桩返回空数组；`company.endpoints.probe` 状态断言改数字。
- **断言已移除/未落地功能**：`ContractLog`（操作日志 Tab 已移除→改测当前 Tab）、`Dashboard`/`DataScreen`（待办/公告/到期合同降级→改测空态）、`AnnouncementList`（状态 Tab/发布人列已无→改测状态标签/项目列）、`MobileNav`（断言不存在的路由→改测核心路由）。
- **真实缺陷顺带修复**：`RenterDetail` 断言对齐 `renterProfileId`（页面正确）并修正报修 fixture 字段 `orderNo`；补 `billing.renterAccount/renterAccountPlaceholder` i18n 键（原缺失，支付页搜索框占位渲染为 key）。

至此测试与 lint/编译全部通过，MSW 与测试 fixture 均与真实后端形态一致。

---

## 五、剩余问题（需后端配合，前端无法单独修复）

**问题**：租户列表"开通状态/当前单元"恒显示"未开通/-"。
**原因**：`GET /renters` 列表不返回 `accountStatus`/`currentUnit` 派生字段，需后端在列表聚合或前端额外查询账号接口。

**问题**：个人中心"修改密码"丢弃旧密码、且普通角色可能 403。
**原因**：后端无自助改密接口，现走 `PATCH /users/:id` 仅传 `{password}`（用户管理域，非自助域），旧密码无处校验。建议后端补 `PATCH /users/me/password`。

**问题**：租户"证件正面/背面"上传不落库。
**原因**：后端 `CreateRenterProfileDto` 不含 `idFrontUrl/idBackUrl`，提交被静默丢弃。已保留 UI 并补 `email`，证件影像待后端建模。

**问题**：仪表盘"收款趋势/报修分布/待办/最新公告/到期合同"为空。
**原因**：后端无对应接口，前端已退化为空数据（详见 `dashboard/index.tsx` 注释）。

**问题**：项目成员列表、资源变更历史、系统设置不可用。
**原因**：`GET /projects/:id/users`、`/system/audit-logs/resource-history`、`/system/settings*` 后端未实现，前端为桩函数/抛错保护。

---

## 六、风险项

**风险等级：中**
**建议**：`src/**/__tests__` 与 `src/mocks`（MSW）仍使用旧形态假数据（`status:'ACTIVE'`、`projectCount`、扁平 `roles`）。本次 `tsc/eslint` 全绿（测试 fixture 为松类型，未触发编译错误），但运行 `vitest` 时部分断言可能因数字状态渲染而失败。建议后续将 MSW handler 与测试 fixture 同步为真实后端形态（数字状态、嵌套 roles/projects、`_count`），保持测试与真实契约一致。

**风险等级：低**
**建议**：`renters/index.tsx` 的 `accountStatus`/`currentUnit` 列在后端补字段前可考虑隐藏或显式标注"需查看详情"，避免误导。

**风险等级：低**
**建议**：仪表盘默认隐藏无后端支撑的子模块（`visibleModules` 默认 false），减少空白卡片。
