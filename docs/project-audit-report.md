# 项目审计报告

生成时间：2026-06-07 19:58

> 审计方式：全量扫描源码（206 个 `.ts/.tsx` 业务文件，约 18,689 行，不含测试），逐一阅读核心基础设施（HTTP 封装 / Token / 路由 / 守卫 / Store / 工具）、全部页面、全部 Service、全部 Mock Handler、共享组件 / Hooks、配置与构建文件。结论基于实际代码而非目录结构推断。

---

# 1. 项目概况

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| UI | Ant Design 6 + Tailwind CSS 4 |
| 状态管理 | Zustand 5（全局态）+ TanStack React Query 5（服务端态） |
| 路由 | React Router 7（`createBrowserRouter` + loader 守卫） |
| 表单 | React Hook Form + Zod（`@hookform/resolvers`） |
| 图表 | ECharts 6（按需 `echarts/core` + tree-shaking） |
| 国际化 | i18next + react-i18next（中 / 英） |
| HTTP | Axios（Token 自动刷新、响应适配层、网络重试、出站 XSS 转义） |
| Mock | MSW 2（17 个 handler，约 117 个端点，~100% 覆盖 Service） |
| 测试 | Vitest + Testing Library（43 单测）、Playwright（8 E2E） |
| 部署 | Docker 两阶段构建 + Nginx + PWA（vite-plugin-pwa） |

## 项目定位

面向物业公司员工的 **多租户 SaaS 物业管理后台（管理端前端）**，按 Sprint 迭代覆盖：平台/公司/项目/员工组织管理、租户档案、房源树、合同审批、收费账单、报修/投诉工单、公告通知、经营报表、系统审计/权限/设置等 12 大业务域。生产环境 API 指向 `https://www.cwuye.com/api`。

## 当前开发阶段

**功能开发收尾期 / 联调前夜（Pre-Integration）。** 前端业务功能已成体系，但**整个应用目前完全跑在 MSW Mock 之上，尚未与真实后端联调验证过**（E2E 也跑在 Mock 上）。`.env.staging`/`.env.production` 已将 `VITE_ENABLE_MSW=false`，Service 层为纯 HTTP 薄封装，切换到真实后端理论上是配置开关级别的改动，但**真实契约从未被验证**。

## 项目总体完成度

**约 82%。**

- 前端功能与 UI 实现：**~90%**
- 共享基础设施 / 架构：**~88%**
- 真实后端联调：**0%（最大缺口）**
- 测试有效性：**~50%（广度够、深度浅）**
- 上线工程化（安全头 / Source Map / 健康检查 / CI）：**~45%**

---

# 2. 功能完成度分析

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 认证登录（login / token 刷新 / 会话超时） | 95% | ✅ 已完成 |
| 仪表盘 Dashboard（KPI / 图表 / 待办 / 大屏） | 100% | ✅ 已完成 |
| 平台-物业公司 | 90% | ✅ 列表+CRUD 完成；详情页「项目/员工」Tab 为占位 |
| 组织-项目管理 | 100% | ✅ 已完成（含授权员工） |
| 组织-员工管理 | 95% | ✅ 已完成（授权项目 Tab 显示裸 ID） |
| 个人中心 Profile | 100% | ✅ 已完成 |
| 客户-租户档案 | 85% | ⚠️ 列表/CRUD/账户完成；详情「合同/账单/报修」Tab 占位；导入结果为假数据 |
| 房源树 Property Tree | 100% | ✅ 已完成（楼栋/楼层/单元 CRUD + 绑定） |
| 房源-入住记录 Leases | 100% | ✅ 已完成（入住/退租） |
| 合同管理 Contracts | 90% | ✅ 审批流/续签/批量完成；详情「附件/操作日志」Tab 占位 |
| 收费-费项管理 | 100% | ✅ 已完成 |
| 收费-账单中心 | 95% | ✅ 已完成；批量催缴为 `setTimeout` 模拟 |
| 收费-抄表导入 | 95% | ✅ 已完成；项目/费项下拉硬编码 |
| 收费-支付订单 | 100% | ✅ 已完成（含 mock 支付成功端点，按设计保留） |
| 工单-报修 Repairs | 100% | ✅ 已完成（派单/进度/完工/消息/时间线） |
| 工单-投诉 Complaints | 100% | ✅ 已完成（分析/申诉/办结流） |
| 公告管理 Announcements | 100% | ✅ 已完成（草稿/发布/归档） |
| 我的消息 Notifications | 100% | ✅ 已完成（乐观更新） |
| 报表（6 张：租金/收缴率/欠费/报修/满意度/费用分析） | 95% | ✅ 已完成；fee-analysis 有 1 处 KPI 硬编码 0 |
| 系统-审计日志 | 100% | ✅ 已完成（列表/回放/统计 + JSON diff） |
| 系统-导出中心 | 50% | ⚠️ UI 完整但进度为 `setInterval` 模拟、下载按钮空操作、无 Service |
| 系统-权限管理 | 55% | ⚠️ 角色矩阵交互完整但仅本地状态、不落库、无 Service |
| 系统-性能监控 | 40% | ⚠️ 数据全部 `Math.random()` 生成，无真实埋点 |
| 系统-系统设置 | 50% | ⚠️ 三张表单完整但保存为 `// TODO` + `console.log` |

**说明：**

- **已完成内容**：12 大业务域中，组织/客户/房源/合同/收费/工单/公告/报表/审计/仪表盘/登录均为「列表 + 筛选 + 创建/编辑抽屉 + 删除 + 详情 + 状态流转 + 批量操作 + 权限门控 + 加载/空/错误态」的真实实现，全部通过 React Query 调 Service。
- **未完成内容**：4 个系统工具页（导出中心、权限管理、性能监控、系统设置）UI 已成型但**未接后端、无对应 Service**，属于「演示态」。
- **缺失内容**：文件上传 / 下载（`/files/*`）**无 Mock、无真实验证**；若干详情页 Tab（租户的合同/账单/报修、公司的项目/员工、合同的附件/操作日志）为「Sprint X 实现」占位文本。

---

# 3. 页面完成度分析

## 已完成页面（真实 Service + CRUD + 详情，约 30 个）

dashboard、login、profile、platform/companies（列表）、org/projects（+detail）、org/users（+detail）、customers/renters（列表）、properties/tree、properties/leases（+detail）、contracts（列表）、billing/fee-items、billing/bills（+detail）、billing/meter-readings、billing/payments、service/repairs（+detail）、service/complaints（+detail）、notice/announcements、notice/notifications、reports/×6、system/audit-logs、NotFound、Forbidden。

## 开发中 / 部分完成页面（UI 完整但有占位 Tab 或假逻辑）

- `customers/renters/detail.tsx` — 合同/账单/报修投诉 Tab 为占位（65%）
- `platform/companies/detail.tsx` — 项目列表/员工列表 Tab 为静态占位（70%）
- `contracts/detail.tsx` — 附件/操作日志 Tab 为占位（85%）

## 占位页面（UI 成型但未接后端，纯演示）

- `system/performance/index.tsx` — 数据全为随机数（40%）
- `system/export-center/index.tsx` — 进度模拟、下载空操作（50%）
- `system/settings/index.tsx` — 保存为 TODO 桩（50%）
- `system/permissions/index.tsx` — 矩阵不落库（55%）

## 空页面

**无。** 全部页面均渲染实质 UI，不存在「coming soon」整页或空 return。

---

# 4. API 接入分析

| 指标 | 数量 |
|------|------|
| Service 文件 | 17 个 |
| Service 端点（唯一 verb+path） | **~117** |
| Mock Handler 文件 | 17 个 |
| Mock 端点 | **~117（覆盖 ~100%）** |
| 真实后端已联调端点 | **0** |
| 无 Mock 的端点 | 文件上传/下载 `/files/upload`、`/files/upload-multiple`、`getFileUrl`（`src/api/upload.ts`） |

**已完成接口（Service 层就绪，HTTP 薄封装，可直连真实后端）**：auth(3)、company(5)、project(7)、user(9)、renter(9)、property(12)、lease(4)、contract(12)、billing(12)、payment(3)、repair(9)、complaint(7)、announcement(7)、notification(4)、audit(2)、dashboard(6)、report(6)。所有 Service 均无业务/硬编码逻辑，仅映射 `http.get/post/put/...`。

**Mock 接口**：17 个 handler，多数为带分页/筛选/有状态变更的逼真数据集（property/contract/repair/complaint/billing/renter 尤其完善）；dashboard/report 为静态 fixture（忽略入参）。

**异常 / 桩接口（需关注）：**

- 🔴 **文件上传/下载无 Mock**：`onUnhandledRequest:'bypass'` 下，Mock 模式上传会直接打网络并 404。这是唯一真正未被任何方式验证的契约。
- 🟡 **`/dashboard/overview` 重复定义**：`mocks/handlers/auth.ts:41`（旧结构，缺 trend 字段）与 `dashboard.ts:5`（完整结构）冲突，MSW 取首个匹配 → auth.ts 版本生效，遮蔽了 UI 期望的 trend 字段。
- 🟡 **空操作桩**：`user.ts` 的 assignRoles/assignProjects/changePassword、`project.ts` 的 PUT users 返回 200 但不改状态，分配类 UI 重查后看不到结果。
- 🟡 **抄表模板类型不符**：Service 以 `responseType:'blob'` 请求，Mock 返回 JSON。
- 🟡 **报表/仪表盘忽略查询参数**：日期范围、项目筛选传了但 Mock 不消费；feeAnalysis 用 2026 日期、其余用 2025。

**接入完成度：Service 层 100% 就绪；真实联调 0%。** 整体「可切换、未验证」。

---

# 5. 代码质量评估

| 项目 | 分数 | 说明 |
|------|------|------|
| 目录结构 | 9/10 | 按 api/components/hooks/services/store/types/pages 分层清晰，pages 按路由组织，types 区分 api/domain，规范度高 |
| 组件设计 | 7.5/10 | DataTable（泛型+虚拟滚动+列偏好持久化）、PermissionGuard（disableOnly 模式）、EChart（ESM interop 修复）质量高；但 ImportWizard 校验为空操作 bug、ConfirmDialog 死代码、DataTable 个别中英文硬编码 |
| TypeScript | 9/10 | 全 `src` 仅 1 处 `any`（Mock，已 eslint-disable）；`strict` + `noUnusedLocals/Parameters` + 项目引用；泛型运用扎实（useTableQuery、StatusTag 等） |
| 状态管理 | 8.5/10 | 5 个 Zustand store 模式统一、localStorage 写穿；切换项目清理 React Query 缓存防租户串数据；但权限逻辑三处重复、project.store 缓存清理过宽 |
| API 封装 | 9/10 | request.ts 含 Token 刷新队列（并发安全）、401/403 处理、网络指数退避重试、CSRF、多租户头、出站 XSS 转义；adapter 解包 envelope；分层干净 |
| 可维护性 | 7.5/10 | i18n 全覆盖、错误上报脱敏、命名一致；扣分于角色数组在 17 个页面手写重复（64 处）、死代码、HeaderBar 内置 mock 推送 |
| 可扩展性 | 8/10 | 新增模块「types→service→mock→page→route」路径清晰、复制成本低；Sprint 注释标明演进；扣分于部分硬编码下拉与路由列表重复 |

**综合代码质量：8.2 / 10 —— 显著高于一般业务项目的成熟度。**

---

# 6. 架构评估

## 优点

- **分层清晰、职责单一**：HTTP 封装 / 适配 / Service / Store / 页面边界明确；服务端态（React Query）与客户端态（Zustand）划分正确。
- **Mock 与真实后端零改动切换**：Service 层薄封装 + `VITE_ENABLE_MSW` 开关 + 三套 env，工程上为联调留足余地。
- **多租户基础扎实**：请求自动注入 `X-Project-Id`，切换项目即清缓存。
- **生产级横切能力**：Token 刷新并发队列、错误上报脱敏（手机/身份证/JWT）、出站 XSS 转义、会话超时、虚拟滚动、PWA、Bundle 分包。
- **类型安全度高**：几乎零 `any`，严格 tsconfig，构建前 `tsc -b` 卡死类型错误。

## 缺点

- **权限模型偏弱且分散**：权限本质是「前端角色路由守卫」，且 `hasRole` 逻辑在 store / `useHasRole` / `PermissionGuard` **三处各实现一遍**；大量路由**未挂 roleLoader**（仅 companies/permissions/settings 等少数有），实际依赖页面内 PermissionGuard 兜底，规则一致性靠人工保证。
- **出站数据被无差别 HTML 转义**（`request.ts:71` → `sanitizeInput`）：会把合法数据（如姓名 `O'Brien`、含 `/` 的字段）转义后发给后端导致**脏数据落库**，这是放错层的安全措施（XSS 应在渲染端防御，而非污染出站负载）。
- **真实契约未验证**：所有 Service 与类型基于自定义 Mock 约定，后端真实返回结构若不符，适配层 / 类型 / 页面将连锁报错。
- **若干工具页与详情 Tab 为演示态**，与真实功能混在同一导航中，易给人「已完成」错觉。

## 扩展风险

- 后端真实接口若不遵循 `{code,data,message}` envelope 或分页字段命名不同，`adapter.ts` 与全部列表页需返工。
- 权限若需「数据级 / 按钮级」细粒度（非纯角色），现有三套角色判断需重构为统一权限点模型。
- 文件上传/下载从未跑通，接入对象存储时风险集中。

## 改进建议

1. **统一权限判断**：`useHasRole` 与 `PermissionGuard` 委托给 store 单一实现；为未挂守卫的敏感路由补 `roleLoader`。
2. **移除出站 sanitize**，改为渲染层转义 + 后端校验。
3. **优先做一轮真实后端联调**（哪怕单模块），验证 envelope/分页/鉴权契约。
4. **演示态页面与真实功能分离**或加「Beta/Mock」标识。

---

# 7. 技术债务分析

**重复代码**
- 角色数组在 17 个页面手写 64 处，未复用 `roles.ts` 的 `ADMIN_ROLES`/`ALL_STAFF_ROLES`（`src/pages/**`、`src/constants/status.ts:98-108`）。
- 权限判断逻辑三处重复（`store/user.store.ts:29-38`、`hooks/useHasRole.ts`、`components/PermissionGuard/index.tsx:23`）。
- `useIsMobile` 在 `layouts/AppLayout.tsx:27` 与 `layouts/Sidebar.tsx:31` 各实现一遍（常量名还不一致）。
- 脱敏逻辑在 `utils/mask.ts` 与 `utils/errorReporter.ts` 各写一套且规则不同。

**无用代码（死代码，建议删除）**
- `src/components/ConfirmDialog/index.tsx`（被 `useConfirm` 取代，无页面引用）。
- `src/hooks/usePagination.ts`（被 useTableQuery 取代，仅自测引用）。
- `src/constants/routeKeys.ts`（仅自引用）。

**`any` 使用**
- 全 `src` 仅 1 处：`src/mocks/handlers/user.ts:84`（已 eslint-disable）。优秀。

**硬编码**
- `DataTable` 分页 `共 ${total} 条`、`'Invalid config file'` 未走 i18n（`components/DataTable/index.tsx:302/185`）。
- 抄表/仪表盘部分项目、费项下拉为硬编码选项（`billing/meter-readings`、`dashboard/index.tsx`）。
- `HeaderBar.tsx:27-63` 内置 `mockPushMessages` + 30s 定时假推送（演示脚手架混入生产头部）。
- `AppLayout.BOTTOM_TABS`（:70-75）硬编码路由列表。

**TODO/FIXME**
- 全库仅 1 处显式 `TODO`：`src/pages/system/settings/index.tsx:41`（保存接口待对接）。

**Mock / 假逻辑（混入业务页）**
- 导出中心 `setInterval` 模拟进度 + 下载空操作（`system/export-center/index.tsx`）。
- 性能监控 `Math.random()` 造数（`system/performance/index.tsx`）。
- 权限管理仅本地状态不落库（`system/permissions/index.tsx`）。
- 账单批量催缴 `setTimeout` 模拟（`billing/bills/index.tsx:141`）。
- 租户导入返回假 `{success:10,failed:0}`（`customers/renters/index.tsx:187`）。
- ImportWizard 校验恒为空（`components/ImportWizard/index.tsx:60` `onValidate([])`）。

**正确性小 bug**
- `reports/fee-analysis/index.tsx:115` topFeeItem KPI 硬编码 `value={0}`。
- `org/users/detail.tsx` 授权项目 Tab 显示裸项目 ID。

---

# 8. 风险分析

## P0（高风险）

- **真实后端从未联调（影响：全应用）**。所有功能仅在 MSW Mock 验证；真实契约不符将导致大面积返工。这是上线的根本性阻断项。
- **Nginx 零安全响应头（影响：全站安全）**。`nginx/default.conf` 无 CSP / X-Frame-Options / X-Content-Type-Options / HSTS / Referrer-Policy。处理租户 PII 的后台，点击劫持 / MIME 嗅探 / XSS 暴露面大。
- **出站数据被无差别转义（影响：数据完整性）**。合法字段（撇号、斜杠）会被转义后落库，造成系统性脏数据。

## P1（中风险）

- **权限仅前端角色守卫且多路由缺守卫（影响：越权访问）**。多数路由无 `roleLoader`，仅靠页面内 PermissionGuard；真正鉴权必须由后端强制。
- **Token 存于 localStorage（影响：XSS 提权）**。一旦 XSS，accessToken/refreshToken 可被读取；建议 httpOnly Cookie 或至少配合严格 CSP。
- **文件上传/下载未实现/未验证（影响：附件类功能）**。`/files/*` 无 Mock、无真实测试。
- **生产无 Source Map（影响：线上排障）**。已装全局错误上报，但堆栈为压缩态不可读。
- **测试有效性偏低（影响：回归保障）**。页面测试多为渲染冒烟、命名与断言不符；E2E 大量 `if(isVisible)` 与 `toBeGreaterThanOrEqual(0)` 永不失败；`test:coverage` 因缺 `@vitest/coverage-v8` 直接报错。

## P2（低风险）

- 4 个系统工具页为演示态，混入正式导航易误判完成度。
- 死代码 / 重复角色数组 / 硬编码文案，增加维护成本。
- Docker 无 HEALTHCHECK、nginx 以 root 运行、`.dockerignore` 未排除 `.env*`。
- ImportWizard 校验失效、fee-analysis KPI、抄表模板 blob 类型不符等局部 bug。

---

# 9. 性能分析

| 检查项 | 现状 | 评价 |
|--------|------|------|
| 路由懒加载 | 除首屏 Dashboard/Login 外全部 `React.lazy()` / route `lazy` | ✅ 良好 |
| Bundle 体积 | 总 JS ~3.0MB（未压缩）：vendor-antd **1.5MB**、vendor-echarts 576KB、export(xlsx) 277KB、index 132KB | ⚠️ antd/echarts 偏重，gzip 后约 0.9–1MB |
| 分包策略 | vendor-react/antd/echarts/query/utils 手动分包，跨平台正则 | ✅ 良好 |
| 图片资源 | 仅 PWA 图标 + svg，无大图 | ✅ 良好 |
| 重复请求 | React Query 缓存 + 分级策略（预取/乐观更新）+ 行级 prefetch | ✅ 良好 |
| 渲染性能 | DataTable >200 行启用虚拟滚动；ChartSkeleton 占位 | ✅ 良好 |
| PWA / 缓存 | autoUpdate + Workbox（字体/图片 CacheFirst、/api NetworkFirst 10s） | ✅ 良好 |

**优化建议：**
1. `vendor-antd` 1.5MB 偏大——确认 antd 按需引入、排查 icons 全量打包；可考虑路由级再细分。
2. `xlsx`（export chunk 277KB）改为仅在导出动作时动态 `import()`。
3. 启用 `build.sourcemap:'hidden'` 并上传错误平台；将 `chunkSizeWarningLimit`（现 1000KB）调回合理值以暴露超大块。
4. echarts 已 tree-shaking，保持；可评估按图表类型再拆。

---

# 10. 安全性分析

| 检查项 | 现状 | 风险 |
|--------|------|------|
| Token 管理 | localStorage 存取 + 自动刷新队列 + 30min 会话超时 + 401 清理跳登录 | ⚠️ localStorage 易受 XSS 读取 |
| 权限控制 | 前端角色路由守卫 + PermissionGuard；逻辑三处重复、多路由缺守卫 | ⚠️ 必须后端强制鉴权 |
| 环境变量 | 三套 env 分环境；仅含 API 基址/标题/开关，无密钥 | ✅ 合规 |
| 敏感信息泄露 | 错误上报前脱敏（手机/身份证/邮箱/JWT）；列表/详情手机身份证掩码 | ✅ 良好（mask 边界略糙） |
| XSS 风险 | 出站 `sanitizeInput` 转义（位置错误，污染数据）；渲染端依赖 React 默认转义；**无 CSP** | ⚠️ 防御放错层 + 缺 CSP |
| CSRF | 请求头注入 `X-CSRF-Token`（从 meta 读取） | ✅ 机制就绪 |

**建议：**补齐 Nginx 安全头与 CSP；将出站 sanitize 改为渲染层防御；Token 迁移 httpOnly Cookie 或强化 CSP；`.dockerignore` 排除 `.env*`；mask 规则统一并收紧 `maskIdCard/maskPhone` 边界。

---

# 11. 上线准备度

| 维度 | 评估 | 得分 |
|------|------|------|
| 功能完整度 | 业务页 ~90%，4 个系统工具页为演示态 | 85% |
| 稳定性 | 仅 Mock 验证、真实联调 0、测试深度浅 | 45% |
| 安全性 | 无安全头/CSP、Token 在 localStorage、出站转义污染数据 | 50% |
| 性能 | 懒加载/分包/虚拟滚动/PWA 齐备，antd 偏重 | 80% |
| 可维护性 | 分层清晰、类型严格、少量死代码与重复 | 82% |

**上线准备度：约 55%。**

**结论判断：**

- ❌ **不适合正式上线**（真实后端未联调、安全头缺失为硬阻断）
- ✅ **可以内部测试 / Demo（基于 Mock）** —— 当前即可
- ⚠️ **灰度发布**：需先完成「真实联调 + 安全头/CSP + Source Map + 关键 E2E 转真后端」后方可
- 🎯 现实定位：**「功能演示就绪，生产联调未启动」**

---

# 12. 下一阶段开发计划

## P0（阻断上线，必须先做）

1. **真实后端联调（按模块推进）**——关 MSW，逐域核对 envelope/分页/鉴权/错误码契约，修正 `adapter.ts` 与类型。**预计 8–12 人日**（取决于后端就绪度）。
2. **Nginx 安全加固**——补 CSP/HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy；index.html 设 no-cache。**预计 1–2 人日**。
3. **移除出站 `sanitizeInput` 转义**，改渲染层防御，回归数据正确性。**预计 0.5 人日**。
4. **文件上传/下载打通**（真实接口 + Mock 兜底）。**预计 1–2 人日**。

## P1（上线前应完成）

5. 4 个系统工具页接真实后端（导出中心/权限管理/性能监控/系统设置），或明确降级为「Beta」隐藏。**预计 4–6 人日**。
6. 统一权限逻辑（三处合一）+ 给敏感路由补 `roleLoader`。**预计 1–2 人日**。
7. 开启 Source Map（hidden）并接错误平台。**预计 0.5 人日**。
8. Token 安全方案（httpOnly Cookie 或强 CSP 兜底）。**预计 1–2 人日**。
9. 修复 `test:coverage`（装 `@vitest/coverage-v8`）+ 设覆盖率阈值。**预计 0.5 人日**。

## P2（质量与稳健）

10. 补齐详情页占位 Tab（租户合同/账单/报修、公司项目/员工、合同附件/操作日志）。**预计 3–4 人日**。
11. 重写页面测试为「行为断言」、E2E 去除永真断言并转真后端。**预计 4–5 人日**。
12. 修复局部 bug：ImportWizard 校验、fee-analysis KPI、抄表模板 blob、用户授权项目裸 ID。**预计 1 人日**。

## P3（优化与清理）

13. 删死代码（ConfirmDialog/usePagination/routeKeys）、收敛角色数组到常量、统一 `useIsMobile`/mask。**预计 1–2 人日**。
14. Bundle 优化（xlsx 动态导入、antd 按需复核、chunk 阈值）。**预计 1–2 人日**。
15. Docker 加 HEALTHCHECK / 非 root / 完善 `.dockerignore`；移除 HeaderBar mock 推送。**预计 1 人日**。

**P0+P1 合计约 18–27 人日；至「可灰度」预计 4–6 周（单人）。**

---

# 13. TODO 清单（按优先级）

- [ ] （P0）逐模块关闭 MSW，与真实后端联调并修正契约/类型
- [ ] （P0）Nginx 补齐 CSP 及全套安全响应头
- [ ] （P0）移除 `request.ts` 出站 `sanitizeInput`，改渲染层防御
- [ ] （P0）打通并验证文件上传/下载 `/files/*`
- [ ] （P0）修复 `/dashboard/overview` 重复 Mock 遮蔽问题
- [ ] （P1）系统设置/权限/导出中心/性能监控 接真实后端或降级隐藏
- [ ] （P1）合并权限判断逻辑三处为一，敏感路由补 roleLoader
- [ ] （P1）开启 hidden Source Map 并接入错误监控平台
- [ ] （P1）Token 迁移 httpOnly Cookie / 强化 CSP
- [ ] （P1）安装 `@vitest/coverage-v8`，修复 `test:coverage` 并设阈值
- [ ] （P2）补齐租户/公司/合同详情占位 Tab
- [ ] （P2）页面测试改为行为断言；E2E 去永真断言、转真后端
- [ ] （P2）修复 ImportWizard 校验空操作、fee-analysis KPI=0、抄表模板 blob 类型
- [ ] （P3）删除死代码、角色数组收敛常量、统一 useIsMobile/mask
- [ ] （P3）xlsx 动态导入、antd 按需复核、降 chunk 警告阈值
- [ ] （P3）Dockerfile 加 HEALTHCHECK/非 root，移除 HeaderBar mock 推送

---

# 14. Tech Lead 总结

**1. 当前项目处于什么水平？**
工程素养明显高于一般业务前端：分层清晰、TypeScript 严格（全库仅 1 处 any）、Token 刷新/错误脱敏/虚拟滚动/PWA/分包等生产级能力齐备，12 大业务域功能成体系。**但它目前是一个"高质量的、跑在 Mock 之上的功能演示版"，而非"经过真实联调的待上线系统"。** 用一句话定位：**架构与功能 85 分，生产就绪度 55 分。**

**2. 最大问题是什么？**
**整个应用从未与真实后端联调——所有功能、类型、适配逻辑都建立在自定义 Mock 约定之上。** 这是横在"演示"与"上线"之间的根本鸿沟；一旦真实契约与 Mock 不符，列表页、适配层、类型会连锁返工。其余问题（安全头、权限、测试深度）都次于此。

**3. 最优先解决的 3 件事？**
① **启动真实后端联调**（哪怕先打通登录+一个完整业务域，验证 envelope/分页/鉴权契约）。
② **Nginx 安全头 + CSP**（当前裸奔，处理 PII 的后台不可接受）。
③ **移除出站数据转义**（正在静默污染落库数据，越早改代价越小）。

**4. 距离上线还有多少工作量？**
P0+P1 约 **18–27 人日**；按单人节奏到"可灰度发布"约 **4–6 周**（强依赖后端就绪度）。到"可正式上线"还需在灰度中补足测试深度与稳定性观测。

**5. 新开发者接手，最大的理解成本在哪里？**
最大成本是**分辨"哪些是真功能、哪些是演示态"**——4 个系统工具页与若干详情 Tab 是 Mock/本地态却混在正式导航里，外观与真功能无异，极易误判完成度。其次是**Mock 与真实后端的边界**（Service 层薄封装看似已接后端，实际全走 MSW），以及**三处重复的权限判断逻辑**需要同步理解。建议接手第一周先读：`api/request.ts` → `api/adapter.ts` → `hooks/useTableQuery.ts` → 任一完整模块（如 contracts）→ `mocks/handlers/index.ts`，即可建立全局心智模型。
