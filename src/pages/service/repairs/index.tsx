import { useState } from 'react';
import { Button, Form, Input, Select, Space, Tabs, Tag, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { repairService } from '@/services/repair.service';
import { RepairStatusMeta, RepairStatusTabKeys, RepairTypeLabelKeys } from '@/constants/status';
import { RepairStatus, RepairType, RoleCode } from '@/types/enums';
import type { RepairOrder, RepairListParams } from '@/types';
import { formatDateTime } from '@/utils/format';
import { getMessageApi } from '@/utils/antd';
import RepairDetailModal from './detail';

export default function RepairListPage() {
  const { t } = useTranslation();
  const [statusTab, setStatusTab] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<RepairOrder, RepairListParams>({
      queryKey: `repairs-${statusTab}`,
      queryFn: (params) => repairService.list({ ...params, status: statusTab || undefined }),
      defaultFilter: {} as RepairListParams,
    });

  const handleTabChange = (key: string) => {
    setStatusTab(key);
    onReset();
    setSelectedRowKeys([]);
  };

  const handleBatchAssign = () => {
    const assignable = data.filter(
      (d) => selectedRowKeys.includes(d.id) && d.status === RepairStatus.SUBMITTED,
    );
    if (assignable.length === 0) {
      getMessageApi()?.warning(t('service.noAssignable'));
      return;
    }
    let engineerId = '';
    Modal.confirm({
      title: t('service.batchAssignTitle', { count: assignable.length }),
      content: (
        <Select
          style={{ width: '100%', marginTop: 8 }}
          placeholder={t('service.selectEngineer')}
          onChange={(v: string) => { engineerId = v; }}
          options={[
            { value: 'eng-001', label: '张工' },
            { value: 'eng-002', label: '李工' },
            { value: 'eng-003', label: '王工' },
          ]}
        />
      ),
      onOk: async () => {
        if (!engineerId) {
          getMessageApi()?.warning(t('service.selectEngineerRequired'));
          return Promise.reject();
        }
        for (const r of assignable) {
          try {
            await repairService.assign(r.id, { assigneeId: engineerId });
          } catch { /* continue */ }
        }
        setSelectedRowKeys([]);
        refetch();
        getMessageApi()?.success(t('service.batchAssignSuccess'));
      },
    });
  };

  const columns: TableColumnsType<RepairOrder> = [
    { title: t('service.repairNo'), dataIndex: 'orderNo', width: 160 },
    { title: t('service.title'), dataIndex: 'description', width: 150, ellipsis: true },
    { title: t('service.renter'), key: 'renter', width: 80, render: (_, r) => r.renterProfile?.name ?? '-' },
    {
      title: t('service.repairType'),
      dataIndex: 'category',
      width: 80,
      render: (v: string) => <Tag>{RepairTypeLabelKeys[v as RepairType] ? t(RepairTypeLabelKeys[v as RepairType]) : v}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 90,
      render: (v: RepairStatus) => <StatusTag status={v} statusMap={RepairStatusMeta} />,
    },
    {
      title: t('service.engineer'),
      key: 'engineer',
      width: 100,
      render: (_, r) => r.assignments?.[0]?.assignee?.realName ?? '-',
    },
    {
      title: t('service.submittedAt'),
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: t('service.rating'),
      key: 'rating',
      width: 90,
      render: (_, r) => r.rating ? `速度${r.rating.speedScore}/质量${r.rating.qualityScore}` : '-',
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
            {t('common.detail')}
          </Button>
        </Space>
      ),
    },
  ];

  const batchBar = selectedRowKeys.length > 0 ? (
    <div className="mb-3 flex items-center gap-3 rounded-md bg-primary/5 px-4 py-2">
      <span className="text-sm font-medium">{t('common.selectedCount', { count: selectedRowKeys.length })}</span>
      <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
        <Button size="small" type="primary" icon={<UserSwitchOutlined />} onClick={handleBatchAssign}>
          {t('service.batchAssign')}
        </Button>
      </PermissionGuard>
      <Button size="small" onClick={() => setSelectedRowKeys([])}>{t('common.cancel')}</Button>
    </div>
  ) : null;

  return (
    <div>
      <PageHeader title={t('service.repairTitle')} />

      <Tabs
        activeKey={statusTab}
        onChange={handleTabChange}
        items={RepairStatusTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <SearchFilterBar<RepairListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('service.repairNo')}>
          <Input placeholder={t('service.repairKeywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="category" label={t('service.repairType')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 120 }}>
            {Object.entries(RepairTypeLabelKeys).map(([key, labelKey]) => (
              <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<RepairOrder>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        batchBar={batchBar}
      />

      <RepairDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />
    </div>
  );
}
