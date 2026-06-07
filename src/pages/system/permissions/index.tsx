import { useState, useMemo } from 'react';
import { Card, Switch, Table, Tag, Tooltip, message, Segmented } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { RoleCode } from '@/types/enums';

interface RoleInfo {
  code: RoleCode;
  nameKey: string;
  descKey: string;
  color: string;
}

const ROLES: RoleInfo[] = [
  { code: RoleCode.PLATFORM_ADMIN, nameKey: 'permissions.platformAdmin', descKey: 'permissions.platformAdminDesc', color: 'red' },
  { code: RoleCode.COMPANY_ADMIN, nameKey: 'permissions.companyAdmin', descKey: 'permissions.companyAdminDesc', color: 'volcano' },
  { code: RoleCode.PROJECT_ADMIN, nameKey: 'permissions.projectAdmin', descKey: 'permissions.projectAdminDesc', color: 'orange' },
  { code: RoleCode.FINANCE, nameKey: 'permissions.finance', descKey: 'permissions.financeDesc', color: 'gold' },
  { code: RoleCode.CUSTOMER_SERVICE, nameKey: 'permissions.customerService', descKey: 'permissions.customerServiceDesc', color: 'cyan' },
  { code: RoleCode.ENGINEER, nameKey: 'permissions.engineer', descKey: 'permissions.engineerDesc', color: 'blue' },
  { code: RoleCode.OPERATIONS, nameKey: 'permissions.operations', descKey: 'permissions.operationsDesc', color: 'purple' },
];

type PermAction = 'view' | 'create' | 'edit' | 'delete';

const ACTIONS: PermAction[] = ['view', 'create', 'edit', 'delete'];

interface ModulePermission {
  key: string;
  module: string;
  [roleCode: string]: boolean | string;
}

interface ActionPermission {
  key: string;
  module: string;
  action: PermAction;
  [roleCode: string]: boolean | string;
}

const DEFAULT_MODULES = [
  'menu.dashboard',
  'menu.platformCompanies',
  'menu.orgProjects',
  'menu.orgUsers',
  'menu.customersRenters',
  'menu.propertiesTree',
  'menu.propertiesLeases',
  'menu.contractsAll',
  'menu.billingFeeItems',
  'menu.billingBills',
  'menu.billingPayments',
  'menu.billingMeterReadings',
  'menu.serviceRepairs',
  'menu.serviceComplaints',
  'menu.noticeAnnouncements',
  'menu.noticeNotifications',
  'menu.reportsRentIncome',
  'menu.reportsFeeAnalysis',
  'menu.systemAuditLogs',
  'menu.systemExportCenter',
];

const DEFAULT_MATRIX: Record<string, RoleCode[]> = {
  'menu.dashboard': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER, RoleCode.OPERATIONS],
  'menu.platformCompanies': [RoleCode.PLATFORM_ADMIN],
  'menu.orgProjects': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  'menu.orgUsers': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
  'menu.customersRenters': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE],
  'menu.propertiesTree': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  'menu.propertiesLeases': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE],
  'menu.contractsAll': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.FINANCE],
  'menu.billingFeeItems': [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE],
  'menu.billingBills': [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE],
  'menu.billingPayments': [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE],
  'menu.billingMeterReadings': [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE],
  'menu.serviceRepairs': [RoleCode.PLATFORM_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER],
  'menu.serviceComplaints': [RoleCode.PLATFORM_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS, RoleCode.CUSTOMER_SERVICE],
  'menu.noticeAnnouncements': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  'menu.noticeNotifications': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER, RoleCode.OPERATIONS],
  'menu.reportsRentIncome': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE],
  'menu.reportsFeeAnalysis': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE],
  'menu.systemAuditLogs': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS],
  'menu.systemExportCenter': [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE],
};

const DEFAULT_ACTION_MATRIX: Record<string, Record<PermAction, RoleCode[]>> = {
  'menu.customersRenters': {
    view: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE],
    create: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE],
    edit: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.CUSTOMER_SERVICE],
    delete: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
  },
  'menu.contractsAll': {
    view: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.FINANCE],
    create: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.CUSTOMER_SERVICE],
    edit: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.CUSTOMER_SERVICE],
    delete: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
  },
  'menu.billingBills': {
    view: [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE, RoleCode.CUSTOMER_SERVICE],
    create: [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE],
    edit: [RoleCode.PLATFORM_ADMIN, RoleCode.FINANCE],
    delete: [RoleCode.PLATFORM_ADMIN],
  },
  'menu.serviceRepairs': {
    view: [RoleCode.PLATFORM_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER],
    create: [RoleCode.PLATFORM_ADMIN, RoleCode.CUSTOMER_SERVICE],
    edit: [RoleCode.PLATFORM_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.ENGINEER],
    delete: [RoleCode.PLATFORM_ADMIN],
  },
  'menu.noticeAnnouncements': {
    view: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
    create: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
    edit: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
    delete: [RoleCode.PLATFORM_ADMIN],
  },
};

const ACTION_LABEL_KEYS: Record<PermAction, string> = {
  view: 'common.detail',
  create: 'common.create',
  edit: 'common.edit',
  delete: 'common.delete',
};

export default function PermissionsPage() {
  const { t } = useTranslation();
  const [matrix, setMatrix] = useState<Record<string, RoleCode[]>>(DEFAULT_MATRIX);
  const [actionMatrix, setActionMatrix] = useState(DEFAULT_ACTION_MATRIX);
  const [mode, setMode] = useState<'module' | 'action'>('module');

  const togglePermission = (moduleKey: string, role: RoleCode) => {
    setMatrix((prev) => {
      const current = prev[moduleKey] ?? [];
      const next = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return { ...prev, [moduleKey]: next };
    });
    message.success(t('permissions.saveSuccess'));
  };

  const toggleActionPermission = (moduleKey: string, action: PermAction, role: RoleCode) => {
    setActionMatrix((prev) => {
      const modulePerm = prev[moduleKey] ?? { view: [], create: [], edit: [], delete: [] };
      const current = modulePerm[action] ?? [];
      const next = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return { ...prev, [moduleKey]: { ...modulePerm, [action]: next } };
    });
    message.success(t('permissions.saveSuccess'));
  };

  const moduleDataSource: ModulePermission[] = useMemo(
    () =>
      DEFAULT_MODULES.map((mod) => {
        const row: ModulePermission = { key: mod, module: mod };
        ROLES.forEach((role) => {
          row[role.code] = (matrix[mod] ?? []).includes(role.code);
        });
        return row;
      }),
    [matrix],
  );

  const actionDataSource: ActionPermission[] = useMemo(() => {
    const rows: ActionPermission[] = [];
    Object.keys(actionMatrix).forEach((mod) => {
      ACTIONS.forEach((action) => {
        const row: ActionPermission = { key: `${mod}-${action}`, module: mod, action };
        ROLES.forEach((role) => {
          row[role.code] = (actionMatrix[mod]?.[action] ?? []).includes(role.code);
        });
        rows.push(row);
      });
    });
    return rows;
  }, [actionMatrix]);

  const moduleColumns: TableColumnsType<ModulePermission> = [
    {
      title: t('permissions.module'),
      dataIndex: 'module',
      width: 180,
      fixed: 'left',
      render: (v: string) => <span className="font-medium">{t(v)}</span>,
    },
    ...ROLES.map((role) => ({
      title: (
        <Tooltip title={t(role.descKey)}>
          <Tag color={role.color}>{t(role.nameKey)}</Tag>
        </Tooltip>
      ),
      dataIndex: role.code,
      width: 130,
      align: 'center' as const,
      render: (granted: boolean, record: ModulePermission) => (
        <Switch
          size="small"
          checked={granted}
          onChange={() => togglePermission(record.key, role.code)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      ),
    })),
  ];

  const actionColumns: TableColumnsType<ActionPermission> = [
    {
      title: t('permissions.module'),
      dataIndex: 'module',
      width: 160,
      fixed: 'left',
      render: (v: string, _: ActionPermission, idx: number) => {
        const isFirst = idx === 0 || actionDataSource[idx - 1]?.module !== v;
        if (!isFirst) return { children: null, props: { rowSpan: 0 } };
        const span = ACTIONS.length;
        return { children: <span className="font-medium">{t(v)}</span>, props: { rowSpan: span } };
      },
    },
    {
      title: t('permissions.action'),
      dataIndex: 'action',
      width: 100,
      fixed: 'left',
      render: (v: PermAction) => <Tag>{t(ACTION_LABEL_KEYS[v])}</Tag>,
    },
    ...ROLES.map((role) => ({
      title: (
        <Tooltip title={t(role.descKey)}>
          <Tag color={role.color}>{t(role.nameKey)}</Tag>
        </Tooltip>
      ),
      dataIndex: role.code,
      width: 120,
      align: 'center' as const,
      render: (granted: boolean, record: ActionPermission) => (
        <Switch
          size="small"
          checked={granted}
          onChange={() => toggleActionPermission(record.module, record.action, role.code)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      ),
    })),
  ];

  return (
    <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
      <div>
        <PageHeader
          title={t('permissions.title')}
          subtitle={t('permissions.roleMatrix')}
          extra={
            <Segmented
              value={mode}
              onChange={(v) => setMode(v as 'module' | 'action')}
              options={[
                { value: 'module', label: t('permissions.module') },
                { value: 'action', label: t('permissions.action') },
              ]}
            />
          }
        />

        <Card className="mb-4">
          <div className="mb-4 flex flex-wrap gap-3">
            {ROLES.map((role) => (
              <div key={role.code} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <Tag color={role.color}>{t(role.nameKey)}</Tag>
                <span className="text-xs text-text-secondary">{t(role.descKey)}</span>
              </div>
            ))}
          </div>
        </Card>

        {mode === 'module' ? (
          <Table<ModulePermission>
            columns={moduleColumns}
            dataSource={moduleDataSource}
            pagination={false}
            size="small"
            scroll={{ x: 1200 }}
            bordered
          />
        ) : (
          <Table<ActionPermission>
            columns={actionColumns}
            dataSource={actionDataSource}
            pagination={false}
            size="small"
            scroll={{ x: 1200 }}
            bordered
          />
        )}
      </div>
    </PermissionGuard>
  );
}
