import type { ReactNode } from 'react';
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  DollarOutlined,
  ToolOutlined,
  NotificationOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { createElement } from 'react';
import { RoleCode } from '@/types/enums';

export interface MenuItemConfig {
  key: string;
  label: string;
  i18nKey: string;
  icon?: ReactNode;
  path?: string;
  roles?: RoleCode[];
  children?: MenuItemConfig[];
  badge?: boolean;
}

// ===== Role groups, must stay in sync with src/router/index.tsx =====
const ADMIN_ROLES: RoleCode[] = [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN];
const CUSTOMER_OPERATION_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE];
const PROPERTY_TREE_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.OPERATIONS];
const FINANCE_ROLES: RoleCode[] = [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN];
const BILLING_VIEW_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.FINANCE];
const METER_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.FINANCE, RoleCode.OPERATIONS];
const REPAIR_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER, RoleCode.OPERATIONS];
const COMPLAINT_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.CUSTOMER_SERVICE, RoleCode.OPERATIONS];
const ANNOUNCEMENT_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.OPERATIONS];
const CONTRACT_VIEW_ROLES: RoleCode[] = [...ADMIN_ROLES, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE];

export const menuConfig: MenuItemConfig[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    i18nKey: 'menu.dashboard',
    icon: createElement(DashboardOutlined),
    path: '/dashboard',
  },
  {
    key: 'platform',
    label: '平台管理',
    i18nKey: 'menu.platform',
    icon: createElement(BankOutlined),
    roles: [RoleCode.PLATFORM_ADMIN],
    children: [
      {
        key: 'platform-companies',
        label: '物业公司',
        i18nKey: 'menu.platformCompanies',
        path: '/platform/companies',
        roles: [RoleCode.PLATFORM_ADMIN],
      },
    ],
  },
  {
    key: 'org',
    label: '组织管理',
    i18nKey: 'menu.org',
    icon: createElement(TeamOutlined),
    roles: ADMIN_ROLES,
    children: [
      {
        key: 'org-projects',
        label: '项目管理',
        i18nKey: 'menu.orgProjects',
        path: '/org/projects',
        roles: ADMIN_ROLES,
      },
      {
        key: 'org-users',
        label: '员工管理',
        i18nKey: 'menu.orgUsers',
        path: '/org/users',
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    i18nKey: 'menu.customers',
    icon: createElement(UserOutlined),
    roles: CUSTOMER_OPERATION_ROLES,
    children: [
      {
        key: 'customers-renters',
        label: '租户档案',
        i18nKey: 'menu.customersRenters',
        path: '/customers/renters',
        roles: CUSTOMER_OPERATION_ROLES,
      },
    ],
  },
  {
    key: 'properties',
    label: '房源管理',
    i18nKey: 'menu.properties',
    icon: createElement(HomeOutlined),
    roles: Array.from(new Set([...PROPERTY_TREE_ROLES, ...CUSTOMER_OPERATION_ROLES])),
    children: [
      {
        key: 'properties-tree',
        label: '房源树',
        i18nKey: 'menu.propertiesTree',
        path: '/properties/tree',
        roles: PROPERTY_TREE_ROLES,
      },
      {
        key: 'properties-leases',
        label: '入住记录',
        i18nKey: 'menu.propertiesLeases',
        path: '/properties/leases',
        roles: CUSTOMER_OPERATION_ROLES,
      },
    ],
  },
  {
    key: 'contracts',
    label: '合同管理',
    i18nKey: 'menu.contracts',
    icon: createElement(FileTextOutlined),
    roles: CONTRACT_VIEW_ROLES,
    children: [
      {
        key: 'contracts-all',
        label: '全部合同',
        i18nKey: 'menu.contractsAll',
        path: '/contracts',
        roles: CONTRACT_VIEW_ROLES,
      },
    ],
  },
  {
    key: 'billing',
    label: '收费管理',
    i18nKey: 'menu.billing',
    icon: createElement(DollarOutlined),
    roles: METER_ROLES,
    children: [
      {
        key: 'billing-fee-items',
        label: '费项管理',
        i18nKey: 'menu.billingFeeItems',
        path: '/billing/fee-items',
        roles: FINANCE_ROLES,
      },
      {
        key: 'billing-bills',
        label: '账单中心',
        i18nKey: 'menu.billingBills',
        path: '/billing/bills',
        roles: BILLING_VIEW_ROLES,
      },
      {
        key: 'billing-meter-readings',
        label: '抄表导入',
        i18nKey: 'menu.billingMeterReadings',
        path: '/billing/meter-readings',
        roles: METER_ROLES,
      },
      {
        key: 'billing-payments',
        label: '支付订单',
        i18nKey: 'menu.billingPayments',
        path: '/billing/payments',
        roles: FINANCE_ROLES,
      },
    ],
  },
  {
    key: 'service',
    label: '服务工单',
    i18nKey: 'menu.service',
    icon: createElement(ToolOutlined),
    roles: REPAIR_ROLES,
    children: [
      {
        key: 'service-repairs',
        label: '报修工单',
        i18nKey: 'menu.serviceRepairs',
        path: '/service/repairs',
        roles: REPAIR_ROLES,
      },
      {
        key: 'service-complaints',
        label: '投诉受理',
        i18nKey: 'menu.serviceComplaints',
        path: '/service/complaints',
        roles: COMPLAINT_ROLES,
      },
    ],
  },
  {
    key: 'notice',
    label: '公告通知',
    i18nKey: 'menu.notice',
    icon: createElement(NotificationOutlined),
    children: [
      {
        key: 'notice-announcements',
        label: '公告管理',
        i18nKey: 'menu.noticeAnnouncements',
        path: '/notice/announcements',
        roles: ANNOUNCEMENT_ROLES,
      },
      {
        key: 'notice-notifications',
        label: '我的消息',
        i18nKey: 'menu.noticeNotifications',
        path: '/notice/notifications',
        badge: true,
      },
    ],
  },
  {
    key: 'reports',
    label: '数据报表',
    i18nKey: 'menu.reports',
    icon: createElement(BarChartOutlined),
    roles: [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS],
    children: [
      {
        key: 'reports-rent-income',
        label: '租金收入',
        i18nKey: 'menu.reportsRentIncome',
        path: '/reports/rent-income',
        roles: FINANCE_ROLES,
      },
      {
        key: 'reports-collection-rate',
        label: '收缴率',
        i18nKey: 'menu.reportsCollectionRate',
        path: '/reports/collection-rate',
        roles: FINANCE_ROLES,
      },
      {
        key: 'reports-overdue',
        label: '欠费明细',
        i18nKey: 'menu.reportsOverdue',
        path: '/reports/overdue',
        roles: FINANCE_ROLES,
      },
      {
        key: 'reports-repair-analysis',
        label: '报修分析',
        i18nKey: 'menu.reportsRepairAnalysis',
        path: '/reports/repair-analysis',
        roles: [...ADMIN_ROLES, RoleCode.OPERATIONS],
      },
      {
        key: 'reports-satisfaction',
        label: '满意度',
        i18nKey: 'menu.reportsSatisfaction',
        path: '/reports/satisfaction',
        roles: [...ADMIN_ROLES, RoleCode.OPERATIONS],
      },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    i18nKey: 'menu.system',
    icon: createElement(SettingOutlined),
    roles: [...ADMIN_ROLES, RoleCode.OPERATIONS],
    children: [
      {
        key: 'system-audit-logs',
        label: '审计日志',
        i18nKey: 'menu.systemAuditLogs',
        path: '/system/audit-logs',
        roles: [...ADMIN_ROLES, RoleCode.OPERATIONS],
      },
      {
        key: 'system-settings',
        label: '系统设置',
        i18nKey: 'menu.systemSettings',
        path: '/system/settings',
        roles: [RoleCode.PLATFORM_ADMIN],
      },
    ],
  },
];
