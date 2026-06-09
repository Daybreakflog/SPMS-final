import { useState } from 'react';
import { Button, Form, Input, Select, Space, Tabs, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { complaintService } from '@/services/complaint.service';
import { ComplaintStatusMeta, ComplaintStatusTabKeys, ComplaintTargetTypeLabelKeys, SeverityLabelKeys, SeverityColors } from '@/constants/status';
import { ComplaintStatus, RoleCode } from '@/types/enums';
import type { Complaint, ComplaintListParams } from '@/types';
import { formatDateTime } from '@/utils/format';
import ComplaintDetailModal from './detail';

export default function ComplaintListPage() {
  const { t } = useTranslation();
  const [statusTab, setStatusTab] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset } =
    useTableQuery<Complaint, ComplaintListParams>({
      queryKey: `complaints-${statusTab}`,
      queryFn: (params) => complaintService.list({ ...params, status: statusTab || undefined }),
      defaultFilter: {} as ComplaintListParams,
    });

  const handleTabChange = (key: string) => {
    setStatusTab(key);
    onReset();
  };

  const columns: TableColumnsType<Complaint> = [
    { title: t('service.complaintNo'), dataIndex: 'complaintNo', width: 160 },
    { title: t('service.title'), dataIndex: 'title', width: 150, ellipsis: true },
    { title: t('service.complainant'), dataIndex: 'complainantName', width: 80 },
    { title: t('service.targetName'), dataIndex: 'targetName', width: 100 },
    {
      title: t('service.targetType'),
      dataIndex: 'targetType',
      width: 80,
      render: (v: string) => <Tag>{ComplaintTargetTypeLabelKeys[v as keyof typeof ComplaintTargetTypeLabelKeys] ? t(ComplaintTargetTypeLabelKeys[v as keyof typeof ComplaintTargetTypeLabelKeys]) : v}</Tag>,
    },
    {
      title: t('service.severity'),
      dataIndex: 'severity',
      width: 80,
      render: (v: string) => <Tag color={SeverityColors[v]}>{SeverityLabelKeys[v] ? t(SeverityLabelKeys[v]) : v}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 90,
      render: (v: ComplaintStatus) => <StatusTag status={v} statusMap={ComplaintStatusMeta} />,
    },
    {
      title: t('service.assignee'),
      dataIndex: 'assigneeName',
      width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: t('service.submittedAt'),
      dataIndex: 'submittedAt',
      width: 160,
      render: (v: string) => formatDateTime(v),
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

  return (
    <PermissionGuard
      roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE, RoleCode.OPERATIONS]}
      fallback={<div className="py-16 text-center text-text-tertiary">{t('common.noPermission')}</div>}
    >
    <div>
      <PageHeader title={t('service.complaintTitle')} />

      <Tabs
        activeKey={statusTab}
        onChange={handleTabChange}
        items={ComplaintStatusTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <SearchFilterBar<ComplaintListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('service.complaintNo')}>
          <Input placeholder={t('service.complaintKeywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="targetType" label={t('service.targetType')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 120 }}>
            {Object.entries(ComplaintTargetTypeLabelKeys).map(([key, labelKey]) => (
              <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Complaint>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <ComplaintDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />
    </div>
    </PermissionGuard>
  );
}
