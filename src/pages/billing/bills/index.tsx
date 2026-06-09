import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Space, Tabs, Modal, message as antMessage } from 'antd';
import { PlusOutlined, CloudUploadOutlined, DownloadOutlined, ExportOutlined, FilterOutlined, BellOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import AdvancedFilter, { type FilterField, type FilterGroup } from '@/components/AdvancedFilter';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { billingService } from '@/services/billing.service';
import { BillStatusMeta, BillStatusTabKeys } from '@/constants/status';
import { RoleCode, BillStatus } from '@/types/enums';
import type { Bill, BillListParams } from '@/types';
import { getMessageApi } from '@/utils/antd';
import { exportToExcel } from '@/utils/export';
import { STALE_TIME } from '@/constants/queryConfig';
import BillFormDrawer from './components/BillFormDrawer';
import BillGenerateModal from './components/BillGenerateModal';
import BillDetailModal from './detail';

export default function BillListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const advancedFields: FilterField[] = [
    { key: 'billNo', label: t('billing.billNo'), type: 'string' },
    { key: 'renterName', label: t('billing.renter'), type: 'string' },
    { key: 'unitNumber', label: t('billing.unit_label'), type: 'string' },
    { key: 'amount', label: t('billing.amount'), type: 'number' },
    { key: 'status', label: t('common.status'), type: 'select', options: [
      { label: t('billing.billTitle'), value: BillStatus.UNPAID },
      { label: t('billing.billTitle'), value: BillStatus.PAID },
      { label: t('billing.billTitle'), value: BillStatus.PARTIAL },
      { label: t('billing.billTitle'), value: BillStatus.OVERDUE },
    ]},
    { key: 'dueDate', label: t('billing.dueDate'), type: 'date' },
  ];

  const handleAdvancedApply = (_group: FilterGroup) => {
    const filter: Partial<BillListParams> = {};
    _group.conditions.forEach((c) => {
      (filter as Record<string, unknown>)[c.field] = c.value;
    });
    onFilterChange(filter as BillListParams);
  };

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Bill, BillListParams>({
      queryKey: 'bills',
      queryFn: (params) => billingService.billList({ ...params, status: statusTab || undefined }),
      defaultFilter: {} as BillListParams,
    });

  const handleTabChange = (key: string) => {
    setStatusTab(key);
    onReset();
  };

  const handlePublish = async () => {
    if (selectedRowKeys.length === 0) {
      getMessageApi()?.warning(t('billing.selectBillsToPublish'));
      return;
    }
    await billingService.billPublish(selectedRowKeys as string[]);
    getMessageApi()?.success(t('billing.publishSuccess'));
    setSelectedRowKeys([]);
    refetch();
  };

  const columns: TableColumnsType<Bill> = [
    { title: t('billing.billNo'), dataIndex: 'billNo', width: 160 },
    { title: t('billing.renter'), dataIndex: 'renterName', width: 80 },
    { title: t('billing.unit'), dataIndex: 'unitNumber', width: 70 },
    { title: t('billing.feeItem'), dataIndex: 'feeItemName', width: 100 },
    { title: t('billing.period'), dataIndex: 'period', width: 90 },
    {
      title: t('billing.amount'),
      dataIndex: 'amount',
      width: 100,
      render: (v: number) => <MoneyDisplay value={v} />,
    },
    {
      title: t('billing.paidAmount'),
      dataIndex: 'paidAmount',
      width: 100,
      render: (v: number) => <MoneyDisplay value={v} />,
    },
    {
      title: t('billing.balance'),
      dataIndex: 'balance',
      width: 100,
      render: (v: number) => <MoneyDisplay value={v} />,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 100,
      render: (v: BillStatus) => <StatusTag status={v} statusMap={BillStatusMeta} />,
    },
    { title: t('billing.dueDate'), dataIndex: 'dueDate', width: 110 },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
            {t('common.detail')}
          </Button>
        </Space>
      ),
    },
  ];

  const handleBatchRemind = () => {
    const unpaid = data.filter(
      (d) => selectedRowKeys.includes(d.id) && (d.status === BillStatus.UNPAID || d.status === BillStatus.OVERDUE),
    );
    if (unpaid.length === 0) {
      getMessageApi()?.warning(t('billing.noRemindable'));
      return;
    }
    Modal.confirm({
      title: t('billing.batchRemindConfirm', { count: unpaid.length }),
      icon: <BellOutlined />,
      content: t('billing.batchRemindDesc'),
      onOk: async () => {
        // 实际对接时调用催缴通知 API
        await new Promise((r) => setTimeout(r, 600));
        setSelectedRowKeys([]);
        antMessage.success(t('billing.batchRemindSuccess'));
      },
    });
  };

  const handleBatchExport = () => {
    const selected = data.filter((d) => selectedRowKeys.includes(d.id));
    exportToExcel(selected as unknown as Record<string, unknown>[], columns as unknown as { title: string | React.ReactNode; dataIndex?: string; key?: string }[], 'bills');
    getMessageApi()?.success(t('report.exportSuccess'));
  };

  const batchBar = selectedRowKeys.length > 0 ? (
    <div className="mb-3 flex items-center gap-3 rounded-md bg-primary/5 px-4 py-2">
      <span className="text-sm font-medium">{t('common.selectedCount', { count: selectedRowKeys.length })}</span>
      <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
        <Button size="small" type="primary" icon={<CloudUploadOutlined />} onClick={handlePublish}>
          {t('common.batchPublish')}
        </Button>
      </PermissionGuard>
      <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
        <Button size="small" icon={<BellOutlined />} onClick={handleBatchRemind}>
          {t('billing.batchRemind')}
        </Button>
      </PermissionGuard>
      <Button size="small" icon={<ExportOutlined />} onClick={handleBatchExport}>
        {t('common.batchExport')}
      </Button>
      <Button size="small" onClick={() => setSelectedRowKeys([])}>{t('common.cancel')}</Button>
    </div>
  ) : null;

  return (
    <div>
      <PageHeader
        title={t('billing.billTitle')}
        extra={
          <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
                {t('billing.createBill')}
              </Button>
              <Button icon={<CloudUploadOutlined />} onClick={() => setGenerateOpen(true)}>
                {t('billing.generateBills')}
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handlePublish}>
                {t('billing.batchPublish')}
              </Button>
            </Space>
          </PermissionGuard>
        }
      />

      <Tabs
        activeKey={statusTab}
        onChange={handleTabChange}
        items={BillStatusTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <SearchFilterBar<BillListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="renterProfileId" label={t('billing.renter')}>
          <Input placeholder={t('billing.renterPlaceholder')} allowClear />
        </Form.Item>
      </SearchFilterBar>

      <div className="mb-2 flex justify-end">
        <Button
          size="small"
          icon={<FilterOutlined />}
          type={showAdvanced ? 'primary' : 'default'}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {t('advancedFilter.title')}
        </Button>
      </div>

      {showAdvanced && (
        <AdvancedFilter
          fields={advancedFields}
          storageKey="bills"
          onApply={handleAdvancedApply}
          onReset={onReset}
        />
      )}

      <DataTable<Bill>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onRow={(record) => ({
          onClick: () => setDetailId(record.id),
          onMouseEnter: () =>
            queryClient.prefetchQuery({
              queryKey: ['bill-detail', record.id],
              queryFn: () => billingService.billDetail(record.id),
              staleTime: STALE_TIME.DETAIL,
            }),
        })}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        tableKey="bills"
        batchBar={batchBar}
      />

      <BillDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      <BillFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { setDrawerOpen(false); refetch(); }}
      />

      <BillGenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={() => { setGenerateOpen(false); refetch(); }}
      />
    </div>
  );
}
