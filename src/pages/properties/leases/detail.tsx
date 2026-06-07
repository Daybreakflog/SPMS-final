import { useParams } from 'react-router-dom';
import { Descriptions, Tabs, Spin, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { leaseService } from '@/services/lease.service';
import { formatDate, formatDateTime } from '@/utils/format';
import { LeaseStatusMeta } from '@/constants/status';
import { LeaseStatus } from '@/types/enums';
export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: lease, isLoading } = useQuery({
    queryKey: ['lease-detail', id],
    queryFn: () => leaseService.detail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!lease) {
    return <div className="text-center text-text-tertiary">记录不存在</div>;
  }

  const coResidentColumns = [
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140, render: (v: string) => v || '-' },
    { title: '关系', dataIndex: 'relation', width: 100, render: (v: string) => v || '-' },
  ];

  return (
    <div>
      <PageHeader title={`入住记录 ${lease.id}`} subtitle={lease.renterName} showBack />

      <Tabs
        items={[
          {
            key: 'info',
            label: '基础信息',
            children: (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="租户">{lease.renterName}</Descriptions.Item>
                <Descriptions.Item label="手机">{lease.renterPhone ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="单元">{lease.unitNumber}</Descriptions.Item>
                <Descriptions.Item label="楼栋">{lease.buildingName ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="项目">{lease.projectName ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusTag status={lease.status as LeaseStatus} statusMap={LeaseStatusMeta} />
                </Descriptions.Item>
                <Descriptions.Item label="入住日期">{formatDate(lease.checkInDate)}</Descriptions.Item>
                <Descriptions.Item label="退租日期">{lease.checkOutDate ? formatDate(lease.checkOutDate) : '-'}</Descriptions.Item>
                <Descriptions.Item label="关联合同">{lease.contractId ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="备注">{lease.remark ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{formatDateTime(lease.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{formatDateTime(lease.updatedAt)}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'coResidents',
            label: '随住人员',
            children: (
              <Table
                columns={coResidentColumns}
                dataSource={lease.coResidents ?? []}
                rowKey="name"
                pagination={false}
                size="middle"
                locale={{ emptyText: '无随住人员' }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
