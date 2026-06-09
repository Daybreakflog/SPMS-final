import { Modal, Descriptions, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import StatusTag from '@/components/StatusTag';
import { leaseService } from '@/services/lease.service';
import { formatDate, formatDateTime } from '@/utils/format';
import { LeaseStatusMeta } from '@/constants/status';
import { LeaseStatus } from '@/types/enums';

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function LeaseDetailModal({ open, id, onClose }: Props) {
  const { data: lease, isLoading } = useQuery({
    queryKey: ['lease-detail', id],
    queryFn: () => leaseService.detail(id),
    enabled: !!id && open,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="入住详情"
      footer={null}
      width={800}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !lease ? (
        <div className="py-8 text-center text-text-tertiary">记录不存在</div>
      ) : (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="租户">{lease.renterProfile?.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="手机">{lease.renterProfile?.phone ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="单元">{lease.unit?.name ?? lease.unit?.code ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="项目">{lease.project?.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <StatusTag status={lease.status as LeaseStatus} statusMap={LeaseStatusMeta} />
          </Descriptions.Item>
          <Descriptions.Item label="入住日期">{formatDate(lease.checkInDate)}</Descriptions.Item>
          <Descriptions.Item label="退租日期">{lease.checkOutDate ? formatDate(lease.checkOutDate) : '-'}</Descriptions.Item>
          <Descriptions.Item label="备注">{lease.remark ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDateTime(lease.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatDateTime(lease.updatedAt)}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
