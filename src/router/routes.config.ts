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
    children: [
      {
        key: 'org-projects',
        label: '项目管理',
        i18nKey: 'menu.orgProjects',
        path: '/org/projects',
      },
      {
        key: 'org-users',
        label: '员工管理',
        i18nKey: 'menu.orgUsers',
        path: '/org/users',
      },
    ],
  },
  {
    key: 'customers',
    label: '客户管理',
    i18nKey: 'menu.customers',
    icon: createElement(UserOutlined),
    children: [
      {
        key: 'customers-renters',
        label: '租户档案',
        i18nKey: 'menu.customersRenters',
        path: '/customers/renters',
      },
    ],
  },
  {
    key: 'properties',
    label: '房源管理',
    i18nKey: 'menu.properties',
    icon: createElement(HomeOutlined),
    children: [
      {
        key: 'properties-tree',
        label: '房源树',
        i18nKey: 'menu.propertiesTree',
        path: '/properties/tree',
      },
      {
        key: 'properties-leases',
        label: '入住记录',
        i18nKey: 'menu.propertiesLeases',
        path: '/properties/leases',
      },
    ],
  },
  {
    key: 'contracts',
    label: '合同管理',
    i18nKey: 'menu.contracts',
    icon: createElement(FileTextOutlined),
    children: [
      {
        key: 'contracts-all',
        label: '全部合同',
        i18nKey: 'menu.contractsAll',
        path: '/contracts',
      },
    ],
  },
  {
    key: 'billing',
    label: '收费管理',
    i18nKey: 'menu.billing',
    icon: createElement(DollarOutlined),
    children: [
      {
        key: 'billing-fee-items',
        label: '费项管理',
        i18nKey: 'menu.billingFeeItems',
        path: '/billing/fee-items',
      },
      {
        key: 'billing-bills',
        label: '账单中心',
        i18nKey: 'menu.billingBills',
        path: '/billing/bills',
      },
      {
        key: 'billing-meter-readings',
        label: '抄表导入',
        i18nKey: 'menu.billingMeterReadings',
        path: '/billing/meter-readings',
      },
      {
        key: 'billing-payments',
        label: '支付订单',
        i18nKey: 'menu.billingPayments',
        path: '/billing/payments',
      },
    ],
  },
  {
    key: 'service',
    label: '服务工单',
    i18nKey: 'menu.service',
    icon: createElement(ToolOutlined),
    children: [
      {
        key: 'service-repairs',
        label: '报修工单',
        i18nKey: 'menu.serviceRepairs',
        path: '/service/repairs',
      },
      {
        key: 'service-complaints',
        label: '投诉受理',
        i18nKey: 'menu.serviceComplaints',
        path: '/service/complaints',
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
    children: [
      {
        key: 'reports-rent-income',
        label: '租金收入',
        i18nKey: 'menu.reportsRentIncome',
        path: '/reports/rent-income',
      },
      {
        key: 'reports-collection-rate',
        label: '收缴率',
        i18nKey: 'menu.reportsCollectionRate',
        path: '/reports/collection-rate',
      },
      {
        key: 'reports-overdue',
        label: '欠费明细',
        i18nKey: 'menu.reportsOverdue',
        path: '/reports/overdue',
      },
      {
        key: 'reports-repair-analysis',
        label: '报修分析',
        i18nKey: 'menu.reportsRepairAnalysis',
        path: '/reports/repair-analysis',
      },
      {
        key: 'reports-satisfaction',
        label: '满意度',
        i18nKey: 'menu.reportsSatisfaction',
        path: '/reports/satisfaction',
      },
      {
        key: 'reports-fee-analysis',
        label: '费用分析',
        i18nKey: 'menu.reportsFeeAnalysis',
        path: '/reports/fee-analysis',
      },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    i18nKey: 'menu.system',
    icon: createElement(SettingOutlined),
    children: [
      {
        key: 'system-audit-logs',
        label: '审计日志',
        i18nKey: 'menu.systemAuditLogs',
        path: '/system/audit-logs',
      },
      {
        key: 'system-export-center',
        label: '导出中心',
        i18nKey: 'menu.systemExportCenter',
        path: '/system/export-center',
      },
      {
        key: 'system-permissions',
        label: '权限管理',
        i18nKey: 'menu.systemPermissions',
        path: '/system/permissions',
        roles: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
      },
      {
        key: 'system-performance',
        label: '性能监控',
        i18nKey: 'menu.systemPerformance',
        path: '/system/performance',
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
