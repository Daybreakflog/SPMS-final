export const RouteKeys = {
  LOGIN: '/auth/staff/login',
  DASHBOARD: '/dashboard',

  PLATFORM_COMPANIES: '/platform/companies',
  PLATFORM_COMPANIES_NEW: '/platform/companies/new',
  PLATFORM_COMPANIES_DETAIL: '/platform/companies/:id',

  ORG_PROJECTS: '/org/projects',
  ORG_PROJECTS_NEW: '/org/projects/new',
  ORG_PROJECTS_DETAIL: '/org/projects/:id',
  ORG_USERS: '/org/users',
  ORG_USERS_NEW: '/org/users/new',
  ORG_USERS_DETAIL: '/org/users/:id',

  CUSTOMERS_RENTERS: '/customers/renters',
  CUSTOMERS_RENTERS_NEW: '/customers/renters/new',
  CUSTOMERS_RENTERS_DETAIL: '/customers/renters/:id',

  PROPERTIES_TREE: '/properties/tree',
  PROPERTIES_LEASES: '/properties/leases',
  PROPERTIES_LEASES_DETAIL: '/properties/leases/:id',

  CONTRACTS: '/contracts',
  CONTRACTS_NEW: '/contracts/new',
  CONTRACTS_DETAIL: '/contracts/:id',
  CONTRACTS_EDIT: '/contracts/:id/edit',

  BILLING_FEE_ITEMS: '/billing/fee-items',
  BILLING_BILLS: '/billing/bills',
  BILLING_BILLS_DETAIL: '/billing/bills/:id',
  BILLING_METER_READINGS: '/billing/meter-readings',
  BILLING_PAYMENTS: '/billing/payments',

  SERVICE_REPAIRS: '/service/repairs',
  SERVICE_REPAIRS_DETAIL: '/service/repairs/:id',
  SERVICE_COMPLAINTS: '/service/complaints',
  SERVICE_COMPLAINTS_DETAIL: '/service/complaints/:id',

  NOTICE_ANNOUNCEMENTS: '/notice/announcements',
  NOTICE_NOTIFICATIONS: '/notice/notifications',

  REPORTS_RENT_INCOME: '/reports/rent-income',
  REPORTS_COLLECTION_RATE: '/reports/collection-rate',
  REPORTS_OVERDUE: '/reports/overdue',
  REPORTS_REPAIR_ANALYSIS: '/reports/repair-analysis',
  REPORTS_SATISFACTION: '/reports/satisfaction',

  SYSTEM_AUDIT_LOGS: '/system/audit-logs',
} as const;
