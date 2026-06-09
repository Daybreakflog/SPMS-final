/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { authLoader, guestLoader, roleLoader } from './guards';
import { RoleCode } from '@/types/enums';

import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';

const NotFoundPage = lazy(() => import('@/pages/NotFound'));
const ForbiddenPage = lazy(() => import('@/pages/Forbidden'));

// ===== Role groups for RBAC =====
// 后台管理员（全平台 / 公司 / 项目）
const ADMIN_ROLES = [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN];
// 客户档案 / 入住 / 合同：管理 + 客服
const CUSTOMER_OPERATION_ROLES = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE];
// 房源结构：管理 + 运营（运营负责房源台账）
const PROPERTY_TREE_ROLES = [...ADMIN_ROLES, RoleCode.OPERATIONS];
// 财务报表 / 账单
const FINANCE_ROLES = [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN];
// 账单中心（财务 + 项目管理员可查）
const BILLING_VIEW_ROLES = [...ADMIN_ROLES, RoleCode.FINANCE];
// 抄表：财务 + 运营 + 管理
const METER_ROLES = [...ADMIN_ROLES, RoleCode.FINANCE, RoleCode.OPERATIONS];
// 报修：全员（含工程师 / 客服 / 运营）
const REPAIR_ROLES = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER, RoleCode.OPERATIONS];
// 投诉：管理 + 客服 + 运营（工程师不处理投诉）
const COMPLAINT_ROLES = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE, RoleCode.OPERATIONS];
// 公告管理：管理 + 运营
const ANNOUNCEMENT_ROLES = [...ADMIN_ROLES, RoleCode.OPERATIONS];

const router = createBrowserRouter([
  {
    path: '/auth/staff/login',
    element: <LoginPage />,
    loader: guestLoader,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    loader: authLoader,
    handle: { title: '首页', i18nKey: 'menu.dashboard' },
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        handle: { title: '仪表盘', i18nKey: 'menu.dashboard' },
      },

      // 平台管理
      {
        path: 'platform/companies',
        loader: roleLoader([RoleCode.PLATFORM_ADMIN]),
        handle: { title: '物业公司', i18nKey: 'menu.platformCompanies' },
        lazy: () => import('@/pages/platform/companies/index').then((m) => ({ Component: m.default })),
      },
      // 组织管理 - 项目
      {
        path: 'org/projects',
        loader: roleLoader(ADMIN_ROLES),
        handle: { title: '项目管理', i18nKey: 'menu.orgProjects' },
        lazy: () => import('@/pages/org/projects/index').then((m) => ({ Component: m.default })),
      },
      // 组织管理 - 员工
      {
        path: 'org/users',
        loader: roleLoader(ADMIN_ROLES),
        handle: { title: '员工管理', i18nKey: 'menu.orgUsers' },
        lazy: () => import('@/pages/org/users/index').then((m) => ({ Component: m.default })),
      },
      // 个人中心（任何登录用户）
      {
        path: 'profile',
        handle: { title: '个人中心', i18nKey: 'menu.profile' },
        lazy: () => import('@/pages/profile/index').then((m) => ({ Component: m.default })),
      },

      // 客户管理
      {
        path: 'customers/renters',
        loader: roleLoader(CUSTOMER_OPERATION_ROLES),
        handle: { title: '租户档案', i18nKey: 'menu.customersRenters' },
        lazy: () => import('@/pages/customers/renters/index').then((m) => ({ Component: m.default })),
      },
      // 房源管理
      {
        path: 'properties/tree',
        loader: roleLoader(PROPERTY_TREE_ROLES),
        handle: { title: '房源树', i18nKey: 'menu.propertiesTree' },
        lazy: () => import('@/pages/properties/tree/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/leases',
        loader: roleLoader(CUSTOMER_OPERATION_ROLES),
        handle: { title: '入住记录', i18nKey: 'menu.propertiesLeases' },
        lazy: () => import('@/pages/properties/leases/index').then((m) => ({ Component: m.default })),
      },
      // 合同管理（不开放给 ENGINEER / TENANT；CUSTOMER_SERVICE 仅有限操作权，详情见 ContractActionRoles）
      {
        path: 'contracts',
        loader: roleLoader([...ADMIN_ROLES, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE]),
        handle: { title: '全部合同', i18nKey: 'menu.contractsAll' },
        lazy: () => import('@/pages/contracts/index').then((m) => ({ Component: m.default })),
      },
      // 收费管理 — Sprint 4
      {
        path: 'billing/fee-items',
        loader: roleLoader(FINANCE_ROLES),
        handle: { title: '费项管理', i18nKey: 'menu.billingFeeItems' },
        lazy: () => import('@/pages/billing/fee-items/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/bills',
        loader: roleLoader(BILLING_VIEW_ROLES),
        handle: { title: '账单中心', i18nKey: 'menu.billingBills' },
        lazy: () => import('@/pages/billing/bills/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/meter-readings',
        loader: roleLoader(METER_ROLES),
        handle: { title: '抄表导入', i18nKey: 'menu.billingMeterReadings' },
        lazy: () => import('@/pages/billing/meter-readings/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/payments',
        loader: roleLoader(FINANCE_ROLES),
        handle: { title: '支付订单', i18nKey: 'menu.billingPayments' },
        lazy: () => import('@/pages/billing/payments/index').then((m) => ({ Component: m.default })),
      },

      // 工单 — Sprint 5
      {
        path: 'service/repairs',
        loader: roleLoader(REPAIR_ROLES),
        handle: { title: '报修工单', i18nKey: 'menu.serviceRepairs' },
        lazy: () => import('@/pages/service/repairs/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'service/complaints',
        loader: roleLoader(COMPLAINT_ROLES),
        handle: { title: '投诉受理', i18nKey: 'menu.serviceComplaints' },
        lazy: () => import('@/pages/service/complaints/index').then((m) => ({ Component: m.default })),
      },
      // 公告 — Sprint 6
      {
        path: 'notice/announcements',
        loader: roleLoader(ANNOUNCEMENT_ROLES),
        handle: { title: '公告管理', i18nKey: 'menu.noticeAnnouncements' },
        lazy: () => import('@/pages/notice/announcements/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'notice/notifications',
        handle: { title: '我的消息', i18nKey: 'menu.noticeNotifications' },
        lazy: () => import('@/pages/notice/notifications/index').then((m) => ({ Component: m.default })),
      },

      // 报表 — Sprint 7
      {
        path: 'reports/rent-income',
        loader: roleLoader(FINANCE_ROLES),
        handle: { title: '租金收入', i18nKey: 'menu.reportsRentIncome' },
        lazy: () => import('@/pages/reports/rent-income/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/collection-rate',
        loader: roleLoader(FINANCE_ROLES),
        handle: { title: '收缴率', i18nKey: 'menu.reportsCollectionRate' },
        lazy: () => import('@/pages/reports/collection-rate/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/overdue',
        loader: roleLoader(FINANCE_ROLES),
        handle: { title: '欠费明细', i18nKey: 'menu.reportsOverdue' },
        lazy: () => import('@/pages/reports/overdue/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/repair-analysis',
        loader: roleLoader([...ADMIN_ROLES, RoleCode.OPERATIONS]),
        handle: { title: '报修分析', i18nKey: 'menu.reportsRepairAnalysis' },
        lazy: () => import('@/pages/reports/repair-analysis/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/satisfaction',
        loader: roleLoader([...ADMIN_ROLES, RoleCode.OPERATIONS]),
        handle: { title: '满意度', i18nKey: 'menu.reportsSatisfaction' },
        lazy: () => import('@/pages/reports/satisfaction/index').then((m) => ({ Component: m.default })),
      },

      // 系统 — Sprint 7
      {
        path: 'system/audit-logs',
        loader: roleLoader([...ADMIN_ROLES, RoleCode.OPERATIONS]),
        handle: { title: '审计日志', i18nKey: 'menu.systemAuditLogs' },
        lazy: () => import('@/pages/system/audit-logs/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'system/settings',
        loader: roleLoader([RoleCode.PLATFORM_ADMIN]),
        handle: { title: '系统设置', i18nKey: 'menu.systemSettings' },
        lazy: () => import('@/pages/system/settings/index').then((m) => ({ Component: m.default })),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
