import { useState } from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import PermissionGuard from '@/components/PermissionGuard';
import StatusTag from '@/components/StatusTag';
import { useTableQuery } from '@/hooks/useTableQuery';
import { leaseService } from '@/services/lease.service';
import { formatDate } from '@/utils/format';
import { LeaseStatusMeta } from '@/constants/status';
import { RoleCode, LeaseStatus } from '@/types/enums';
import type { Lease, LeaseListParams } from '@/types';
import CheckInDrawer from './components/CheckInDrawer';
import CheckOutModal from './components/CheckOutModal';

function getDaysBetween(start: string, end?: string): number {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LeaseListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkOutLeaseId, setCheckOutLeaseId] = useState('');

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Lease, LeaseListParams>({
      queryKey: 'leases',
      queryFn: leaseService.list,
    });

  const handleCheckOut = (id: string) => {
    setCheckOutLeaseId(id);
    setCheckOutOpen(true);
  };

  const columns: TableColumnsType<Lease> = [
    { title: t('lease.renter'), dataIndex: 'renterName', width: 100 },
    { title: t('lease.unit'), dataIndex: 'unitNumber', width: 100 },
    { title: t('lease.building'), dataIndex: 'buildingName', width: 100 },
    { title: t('lease.project'), dataIndex: 'projectName', width: 120 },
    {
      title: t('lease.checkInDate'),
      dataIndex: 'checkInDate',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: t('lease.checkOutDate'),
      dataIndex: 'checkOutDate',
      width: 120,
      render: (v: string) => v ? formatDate(v) : '-',
    },
    {
      title: t('lease.duration'),
      key: 'duration',
      width: 100,
      render: (_, record) => `${getDaysBetween(record.checkInDate, record.checkOutDate)} 天`,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 90,
      render: (v: LeaseStatus) => <StatusTag status={v} statusMap={LeaseStatusMeta} />,
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/properties/leases/${record.id}`)}>
            {t('common.detail')}
          </Button>
          {record.status === 'ACTIVE' && (
            <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
              <Button type="link" size="small" danger onClick={() => handleCheckOut(record.id)}>
                {t('lease.checkOut')}
              </Button>
            </PermissionGuard>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('lease.title')}
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCheckInOpen(true)}>
              {t('lease.checkIn')}
            </Button>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<LeaseListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('lease.keyword')}>
          <Input placeholder={t('lease.keywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="status" label={t('common.status')}>
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="ACTIVE">在住</Select.Option>
            <Select.Option value="CHECKED_OUT">已退租</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Lease>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <CheckInDrawer
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onSuccess={() => { setCheckInOpen(false); refetch(); }}
      />

      <CheckOutModal
        open={checkOutOpen}
        leaseId={checkOutLeaseId}
        onClose={() => setCheckOutOpen(false)}
        onSuccess={() => { setCheckOutOpen(false); refetch(); }}
      />
    </div>
  );
}
