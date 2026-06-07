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

const router = createBrowserRouter([
  {
    path: '/login',
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
      {
        path: 'platform/companies/:id',
        loader: roleLoader([RoleCode.PLATFORM_ADMIN]),
        handle: { title: '公司详情', i18nKey: 'menu.platformCompanies' },
        lazy: () => import('@/pages/platform/companies/detail').then((m) => ({ Component: m.default })),
      },

      // 组织管理 - 项目
      {
        path: 'org/projects',
        handle: { title: '项目管理', i18nKey: 'menu.orgProjects' },
        lazy: () => import('@/pages/org/projects/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'org/projects/:id',
        handle: { title: '项目详情', i18nKey: 'menu.orgProjects' },
        lazy: () => import('@/pages/org/projects/detail').then((m) => ({ Component: m.default })),
      },

      // 组织管理 - 员工
      {
        path: 'org/users',
        handle: { title: '员工管理', i18nKey: 'menu.orgUsers' },
        lazy: () => import('@/pages/org/users/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'org/users/:id',
        handle: { title: '员工详情', i18nKey: 'menu.orgUsers' },
        lazy: () => import('@/pages/org/users/detail').then((m) => ({ Component: m.default })),
      },

      // 个人中心
      {
        path: 'profile',
        handle: { title: '个人中心', i18nKey: 'menu.profile' },
        lazy: () => import('@/pages/profile/index').then((m) => ({ Component: m.default })),
      },

      // 客户管理
      {
        path: 'customers/renters',
        handle: { title: '租户档案', i18nKey: 'menu.customersRenters' },
        lazy: () => import('@/pages/customers/renters/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'customers/renters/:id',
        handle: { title: '租户详情', i18nKey: 'menu.customersRenters' },
        lazy: () => import('@/pages/customers/renters/detail').then((m) => ({ Component: m.default })),
      },

      // 房源管理
      {
        path: 'properties/tree',
        handle: { title: '房源树', i18nKey: 'menu.propertiesTree' },
        lazy: () => import('@/pages/properties/tree/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/leases',
        handle: { title: '入住记录', i18nKey: 'menu.propertiesLeases' },
        lazy: () => import('@/pages/properties/leases/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'properties/leases/:id',
        handle: { title: '入住详情', i18nKey: 'menu.propertiesLeases' },
        lazy: () => import('@/pages/properties/leases/detail').then((m) => ({ Component: m.default })),
      },

      // 合同管理
      {
        path: 'contracts',
        handle: { title: '全部合同', i18nKey: 'menu.contractsAll' },
        lazy: () => import('@/pages/contracts/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'contracts/:id',
        handle: { title: '合同详情', i18nKey: 'menu.contractsAll' },
        lazy: () => import('@/pages/contracts/detail').then((m) => ({ Component: m.default })),
      },

      // 收费管理 — Sprint 4
      {
        path: 'billing/fee-items',
        handle: { title: '费项管理', i18nKey: 'menu.billingFeeItems' },
        lazy: () => import('@/pages/billing/fee-items/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/bills',
        handle: { title: '账单中心', i18nKey: 'menu.billingBills' },
        lazy: () => import('@/pages/billing/bills/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/bills/:id',
        handle: { title: '账单详情', i18nKey: 'menu.billingBills' },
        lazy: () => import('@/pages/billing/bills/detail').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/meter-readings',
        handle: { title: '抄表导入', i18nKey: 'menu.billingMeterReadings' },
        lazy: () => import('@/pages/billing/meter-readings/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'billing/payments',
        handle: { title: '支付订单', i18nKey: 'menu.billingPayments' },
        lazy: () => import('@/pages/billing/payments/index').then((m) => ({ Component: m.default })),
      },

      // 工单 — Sprint 5
      {
        path: 'service/repairs',
        handle: { title: '报修工单', i18nKey: 'menu.serviceRepairs' },
        lazy: () => import('@/pages/service/repairs/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'service/repairs/:id',
        handle: { title: '报修详情', i18nKey: 'menu.serviceRepairs' },
        lazy: () => import('@/pages/service/repairs/detail').then((m) => ({ Component: m.default })),
      },
      {
        path: 'service/complaints',
        handle: { title: '投诉受理', i18nKey: 'menu.serviceComplaints' },
        lazy: () => import('@/pages/service/complaints/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'service/complaints/:id',
        handle: { title: '投诉详情', i18nKey: 'menu.serviceComplaints' },
        lazy: () => import('@/pages/service/complaints/detail').then((m) => ({ Component: m.default })),
      },

      // 公告 — Sprint 6
      {
        path: 'notice/announcements',
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
        handle: { title: '租金收入', i18nKey: 'menu.reportsRentIncome' },
        lazy: () => import('@/pages/reports/rent-income/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/collection-rate',
        handle: { title: '收缴率', i18nKey: 'menu.reportsCollectionRate' },
        lazy: () => import('@/pages/reports/collection-rate/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/overdue',
        handle: { title: '欠费明细', i18nKey: 'menu.reportsOverdue' },
        lazy: () => import('@/pages/reports/overdue/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/repair-analysis',
        handle: { title: '报修分析', i18nKey: 'menu.reportsRepairAnalysis' },
        lazy: () => import('@/pages/reports/repair-analysis/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/satisfaction',
        handle: { title: '满意度', i18nKey: 'menu.reportsSatisfaction' },
        lazy: () => import('@/pages/reports/satisfaction/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'reports/fee-analysis',
        handle: { title: '费用分析', i18nKey: 'menu.reportsFeeAnalysis' },
        lazy: () => import('@/pages/reports/fee-analysis/index').then((m) => ({ Component: m.default })),
      },

      // 系统 — Sprint 7
      {
        path: 'system/audit-logs',
        handle: { title: '审计日志', i18nKey: 'menu.systemAuditLogs' },
        lazy: () => import('@/pages/system/audit-logs/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'system/export-center',
        handle: { title: '导出中心', i18nKey: 'menu.systemExportCenter' },
        lazy: () => import('@/pages/system/export-center/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'system/permissions',
        loader: roleLoader([RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]),
        handle: { title: '权限管理', i18nKey: 'menu.systemPermissions' },
        lazy: () => import('@/pages/system/permissions/index').then((m) => ({ Component: m.default })),
      },
      {
        path: 'system/performance',
        handle: { title: '性能监控', i18nKey: 'menu.systemPerformance' },
        lazy: () => import('@/pages/system/performance/index').then((m) => ({ Component: m.default })),
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
