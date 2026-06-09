import { useState } from 'react';
import { Button, Form, Input, DatePicker, Space, Tabs, Modal, Input as AInput } from 'antd';
import { PlusOutlined, ExportOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import PermissionGuard from '@/components/PermissionGuard';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import { useTableQuery } from '@/hooks/useTableQuery';
import { useUserStore } from '@/store/user.store';
import { contractService } from '@/services/contract.service';
import { formatDate } from '@/utils/format';
import { ContractStatusMeta, ContractStatusTabKeys, ContractActionMatrix, ContractActionRoles } from '@/constants/status';
import { RoleCode, ContractStatus } from '@/types/enums';
import type { Contract, ContractListParams } from '@/types';
import type { ContractAction } from '@/constants/status';
import { getMessageApi } from '@/utils/antd';
import { exportToExcel } from '@/utils/export';
import ContractFormDrawer from './components/ContractFormDrawer';
import ContractDetailModal from './detail';

const { RangePicker } = DatePicker;

function useContractActions() {
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  return (status: ContractStatus): ContractAction[] => {
    const allowed = ContractActionMatrix[status] ?? [];
    return allowed.filter((action) => {
      const requiredRoles = ContractActionRoles[action];
      return requiredRoles.some((r) => userRoles.includes(r));
    });
  };
}

export default function ContractListPage() {
  const { t } = useTranslation();
  const [statusTab, setStatusTab] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const getActions = useContractActions();

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Contract, ContractListParams>({
      queryKey: 'contracts',
      queryFn: (params) => contractService.list({ ...params, status: statusTab || undefined }),
      defaultFilter: {} as ContractListParams,
    });

  const handleTabChange = (key: string) => {
    setStatusTab(key);
    onReset();
  };

  const handleEdit = (record: Contract) => {
    setEditingContract(record);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingContract(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (id: string) => {
    await contractService.submit(id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await contractService.remove(id);
    refetch();
  };

  const columns: TableColumnsType<Contract> = [
    { title: t('contract.contractNo'), dataIndex: 'contractNo', width: 160 },
    { title: t('contract.renter'), dataIndex: 'renterName', width: 100 },
    { title: t('contract.unit'), dataIndex: 'unitNumber', width: 80 },
    { title: t('contract.building'), dataIndex: 'buildingName', width: 80 },
    {
      title: t('contract.monthlyRent'),
      dataIndex: 'monthlyRent',
      width: 120,
      render: (v: number) => <MoneyDisplay value={v} />,
    },
    {
      title: t('contract.dateRange'),
      key: 'dateRange',
      width: 200,
      render: (_, record) => `${formatDate(record.startDate)} ~ ${formatDate(record.endDate)}`,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 120,
      render: (v: ContractStatus) => <StatusTag status={v} statusMap={ContractStatusMeta} />,
    },
    { title: t('contract.creator'), dataIndex: 'creatorName', width: 100 },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => {
        const actions = getActions(record.status as ContractStatus);
        return (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
              {t('common.detail')}
            </Button>
            {actions.includes('edit') && (
              <Button type="link" size="small" onClick={() => handleEdit(record)}>
                {t('common.edit')}
              </Button>
            )}
            {actions.includes('submit') && (
              <Button type="link" size="small" onClick={() => handleSubmit(record.id)}>
                {t('contract.submit')}
              </Button>
            )}
            {actions.includes('delete') && (
              <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>
                {t('common.delete')}
              </Button>
            )}
            {/* 续签入口已移除，请走合同详情页的「续签」按钮（调用 POST /contracts/:id/renew） */}
          </Space>
        );
      },
    },
  ];

  const handleBatchExport = () => {
    const selected = data.filter((d) => selectedRowKeys.includes(d.id));
    exportToExcel(selected as unknown as Record<string, unknown>[], columns as unknown as { title: string | React.ReactNode; dataIndex?: string; key?: string }[], 'contracts');
    getMessageApi()?.success(t('report.exportSuccess'));
  };

  const handleBatchApprove = () => {
    const approvable = data.filter(
      (d) => selectedRowKeys.includes(d.id) && (d.status === ContractStatus.PENDING_FINANCE || d.status === ContractStatus.PENDING_ADMIN),
    );
    if (approvable.length === 0) {
      getMessageApi()?.warning(t('contract.noApprovable'));
      return;
    }
    Modal.confirm({
      title: t('contract.batchApproveConfirm', { count: approvable.length }),
      content: <AInput.TextArea placeholder={t('contract.approveRemarkPlaceholder')} id="batch-approve-remark" rows={3} />,
      onOk: async () => {
        const remark = (document.getElementById('batch-approve-remark') as HTMLTextAreaElement)?.value ?? '';
        for (const c of approvable) {
          try {
            if (c.status === ContractStatus.PENDING_FINANCE) {
              await contractService.financeApprove(c.id, { comment: remark });
            } else if (c.status === ContractStatus.PENDING_ADMIN) {
              await contractService.adminSign(c.id, { comment: remark });
            }
          } catch { /* continue */ }
        }
        setSelectedRowKeys([]);
        refetch();
        getMessageApi()?.success(t('contract.batchApproveSuccess'));
      },
    });
  };

  const handleBatchDelete = async () => {
    const drafts = data.filter(
      (d) => selectedRowKeys.includes(d.id) && d.status === ContractStatus.DRAFT,
    );
    for (const d of drafts) {
      await contractService.remove(d.id);
    }
    setSelectedRowKeys([]);
    refetch();
    getMessageApi()?.success(t('common.deleteSuccess'));
  };

  const batchBar = selectedRowKeys.length > 0 ? (
    <div className="mb-3 flex items-center gap-3 rounded-md bg-primary/5 px-4 py-2">
      <span className="text-sm font-medium">{t('common.selectedCount', { count: selectedRowKeys.length })}</span>
      <Button size="small" icon={<ExportOutlined />} onClick={handleBatchExport}>
        {t('common.batchExport')}
      </Button>
      <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.FINANCE, RoleCode.PROJECT_ADMIN]}>
        <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={handleBatchApprove}>
          {t('contract.batchApprove')}
        </Button>
      </PermissionGuard>
      <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
          {t('common.batchDelete')}
        </Button>
      </PermissionGuard>
      <Button size="small" onClick={() => setSelectedRowKeys([])}>{t('common.cancel')}</Button>
    </div>
  ) : null;

  return (
    <div>
      <PageHeader
        title={t('contract.title')}
        extra={
          <PermissionGuard roles={[RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('contract.createTitle')}
            </Button>
          </PermissionGuard>
        }
      />

      <Tabs
        activeKey={statusTab}
        onChange={handleTabChange}
        items={ContractStatusTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <SearchFilterBar<ContractListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('contract.keyword')}>
          <Input placeholder={t('contract.keywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="startDateRange" label={t('contract.startDateRange')}>
          <RangePicker />
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Contract>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onRow={(record) => ({ onClick: () => setDetailId(record.id) })}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        tableKey="contracts"
        batchBar={batchBar}
      />

      <ContractDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      <ContractFormDrawer
        open={drawerOpen}
        contract={editingContract}
        onClose={() => { setDrawerOpen(false); setEditingContract(null); }}
        onSuccess={() => { setDrawerOpen(false); setEditingContract(null); refetch(); }}
      />

    </div>
  );
}
