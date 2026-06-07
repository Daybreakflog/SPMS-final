import { useState } from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { billingService } from '@/services/billing.service';
import { BillingRuleLabelKeys, FeeItemCycleLabelKeys, FeeItemStatusMeta, BillingRuleUnitKeys } from '@/constants/status';
import { RoleCode, BillingRule, FeeItemStatus } from '@/types/enums';
import type { FeeItem, FeeItemListParams } from '@/types';
import FeeItemFormDrawer from './components/FeeItemFormDrawer';

export default function FeeItemListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<FeeItem, FeeItemListParams>({
      queryKey: 'feeItems',
      queryFn: (params) => billingService.feeItemList(params),
      defaultFilter: {} as FeeItemListParams,
    });

  const handleCreate = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (record: FeeItem) => {
    setEditingItem(record);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await billingService.feeItemRemove(id);
    refetch();
  };

  const columns: TableColumnsType<FeeItem> = [
    { title: 'ID', dataIndex: 'id', width: 100 },
    { title: t('billing.feeItemName'), dataIndex: 'name', width: 120 },
    {
      title: t('billing.billingRule'),
      dataIndex: 'billingRule',
      width: 100,
      render: (v: BillingRule) => t(BillingRuleLabelKeys[v]),
    },
    {
      title: t('billing.unitPrice'),
      dataIndex: 'unitPrice',
      width: 120,
      render: (v: number, record) => (
        <span><MoneyDisplay value={v} />{BillingRuleUnitKeys[record.billingRule as BillingRule] ? `/${t(BillingRuleUnitKeys[record.billingRule as BillingRule]).replace('元/', '')}` : ''}</span>
      ),
    },
    { title: t('billing.unit'), dataIndex: 'unit', width: 80 },
    {
      title: t('billing.cycle'),
      dataIndex: 'cycle',
      width: 80,
      render: (v: string) => FeeItemCycleLabelKeys[v as keyof typeof FeeItemCycleLabelKeys] ? t(FeeItemCycleLabelKeys[v as keyof typeof FeeItemCycleLabelKeys]) : v,
    },
    { title: t('billing.relatedProject'), dataIndex: 'projectName', width: 120 },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 80,
      render: (v: FeeItemStatus) => <StatusTag status={v} statusMap={FeeItemStatusMeta} />,
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              {t('common.edit')}
            </Button>
            <Button type="link" size="small" danger onClick={() => handleDelete(record.id)}>
              {t('common.delete')}
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('billing.feeItemTitle')}
        extra={
          <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('billing.createFeeItem')}
            </Button>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<FeeItemListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('billing.feeItemName')}>
          <Input placeholder={t('billing.feeItemNamePlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="billingRule" label={t('billing.billingRule')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 140 }}>
            {Object.entries(BillingRuleLabelKeys).map(([key, labelKey]) => (
              <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label={t('common.status')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 120 }}>
            <Select.Option value="ACTIVE">启用</Select.Option>
            <Select.Option value="DISABLED">禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<FeeItem>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <FeeItemFormDrawer
        open={drawerOpen}
        feeItem={editingItem}
        onClose={() => { setDrawerOpen(false); setEditingItem(null); }}
        onSuccess={() => { setDrawerOpen(false); setEditingItem(null); refetch(); }}
      />
    </div>
  );
}
