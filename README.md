# 智慧物业管理系统 (SPMS) — 管理端前端

智慧物业管理系统（Smart Property Management System）管理端前端，面向物业公司员工提供运营管理后台。

> **v1.3 新增**：虚拟滚动表格、Zod 表单校验、全局错误上报+反馈浮窗、缓存策略分级（预取/乐观更新）、打印与 PDF 导出、审计日志前后数据 JSON diff、主题定制系统（自定义主色 + 预设方案）。统一 `EChart` 封装修复 dev 模式 ESM interop 渲染问题。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| UI | Ant Design 6 + Tailwind CSS 4 |
| 状态管理 | Zustand 5（全局状态）+ React Query 5（服务端状态） |
| 路由 | React Router 7 |
| 图表 | ECharts 6 |
| 国际化 | i18next + react-i18next |
| 表单 | React Hook Form + Zod |
| HTTP | Axios（Token 自动刷新、响应适配层） |
| Mock | MSW 2 |
| 测试 | Vitest + Testing Library（单元）、Playwright（E2E） |
| 部署 | Docker + Nginx |

## 目录结构

```
src/
├── api/              # HTTP 封装、Token 管理、适配层
├── components/       # 公共组件（DataTable, FormDrawer, StatusTag...）
├── hooks/            # 公共 Hooks（useTableQuery, useDebounce...）
├── layouts/          # 布局组件（AppLayout, Sidebar, HeaderBar）
├── locales/          # i18n 翻译文件（zh-CN, en-US）
├── mocks/            # MSW mock handlers
├── pages/            # 按路由组织的页面模块
├── router/           # 路由配置
├── services/         # API service 层
├── store/            # Zustand stores
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── test/             # 测试配置
```

## 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器（含 MSW mock，端口 3000）
npm run dev

# 开发环境账号
# 用户名: admin  密码: admin123
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3000） |
| `npm run build` | TypeScript 编译 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run e2e` | 运行 Playwright E2E 测试 |
| `npm run e2e:ui` | Playwright UI 模式 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm run build:analyze` | 构建并打开 Bundle 分析 |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | API 基础路径 | `/api` |
| `VITE_APP_TITLE` | 应用标题 | `智慧物业管理系统` |
| `VITE_ENABLE_MSW` | 是否启用 MSW mock | `true`（开发）/ `false`（其他） |

环境文件：`.env.development`（开发）、`.env.staging`（测试）、`.env.production`（生产）。

## 架构说明

- **路由**：30+ 路由，非首屏均已 `React.lazy()` 懒加载，路由级权限守卫
- **状态管理**：Zustand 管理用户、主题、菜单等全局状态；React Query 管理服务端数据缓存与同步
- **API 层**：`request.ts` 封装 Axios，含 Token 自动刷新；`adapter.ts` 适配 Mock/真实后端响应格式差异；Service 层按模块划分
- **Mock 策略**：MSW 拦截请求，通过 `VITE_ENABLE_MSW` 控制开关，切换时 Service 层零修改
- **国际化**：所有 UI 文案走 `t('namespace.key')`，支持中英文切换
- **Bundle 分包**：vendor-react / vendor-antd / vendor-echarts / vendor-query / vendor-utils

详细架构请参考 [docs/architecture.md](docs/architecture.md)，部署指南请参考 [docs/deployment.md](docs/deployment.md)。
