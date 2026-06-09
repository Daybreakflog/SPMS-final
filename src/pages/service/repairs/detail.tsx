import { useState, useMemo } from 'react';
import { Modal, Descriptions, Spin, Timeline, Button, Space, Card, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  ToolOutlined,
  StarOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StatusTag from '@/components/StatusTag';
import { repairService } from '@/services/repair.service';
import { formatDateTime } from '@/utils/format';
import { RepairStatusMeta, RepairActionMatrix, RepairActionRoles, RepairTypeLabelKeys } from '@/constants/status';
import { RepairStatus } from '@/types/enums';
import type { RoleCode } from '@/types/enums';
import type { RepairAction } from '@/constants/status';
import { useUserStore } from '@/store/user.store';
import AssignModal from './components/AssignModal';
import ProgressModal from './components/ProgressModal';
import CompleteModal from './components/CompleteModal';
import RepairMessageList from './components/RepairMessageList';

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function RepairDetailModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  const { data: repair, isLoading, refetch } = useQuery({
    queryKey: ['repair-detail', id],
    queryFn: () => repairService.detail(id),
    enabled: !!id && open,
  });

  const [assignOpen, setAssignOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const timelineItems = useMemo(() => {
    if (!repair) return [];
    type Item = { key: string; color: string; icon: React.ReactNode; label: string; meta?: string; remark?: string; createdAt: string };
    const items: Item[] = [];
    items.push({
      key: 'submit',
      color: 'blue',
      icon: <SendOutlined />,
      label: t('service.actionSubmit'),
      meta: repair.renterProfile?.name,
      createdAt: repair.createdAt,
    });
    (repair.assignments ?? []).forEach((a) => {
      items.push({
        key: `assign-${a.id}`,
        color: 'cyan',
        icon: <UserSwitchOutlined />,
        label: t('service.actionAssign'),
        meta: a.assignee?.realName,
        remark: a.remark ?? undefined,
        createdAt: a.createdAt,
      });
    });
    (repair.progresses ?? []).forEach((p) => {
      items.push({
        key: `progress-${p.id}`,
        color: 'orange',
        icon: <ToolOutlined />,
        label: t('service.actionProgress'),
        remark: p.content,
        createdAt: p.createdAt,
      });
    });
    if (repair.status === RepairStatus.COMPLETED || repair.status === RepairStatus.RATED) {
      const last = (repair.progresses ?? []).at(-1);
      if (last) {
        items.push({
          key: 'complete',
          color: 'green',
          icon: <CheckCircleOutlined />,
          label: t('service.actionComplete'),
          createdAt: last.createdAt,
        });
      }
    }
    if (repair.rating) {
      items.push({
        key: 'rate',
        color: 'gold',
        icon: <StarOutlined />,
        label: t('service.actionRate'),
        remark: repair.rating.comment ?? undefined,
        createdAt: repair.rating.createdAt ?? repair.updatedAt,
      });
    }
    return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [repair, t]);

  const handleSuccess = () => {
    setAssignOpen(false);
    setProgressOpen(false);
    setCompleteOpen(false);
    refetch();
  };

  const status = repair?.status as RepairStatus;
  const allowedActions = repair
    ? (RepairActionMatrix[status] ?? []).filter((action: RepairAction) => {
        const requiredRoles = RepairActionRoles[action];
        return requiredRoles.some((r: RoleCode) => userRoles.includes(r));
      })
    : [];

  const latestAssignment = repair?.assignments?.at(-1);
  const lastProgress = repair?.progresses?.at(-1);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        repair ? (
          <Space>
            <span>{repair.orderNo}</span>
            <StatusTag status={status} statusMap={RepairStatusMeta} />
          </Space>
        ) : '报修详情'
      }
      footer={null}
      width={1200}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !repair ? (
        <div className="py-8 text-center text-text-tertiary">{t('common.noData')}</div>
      ) : (
        <>
          <div className="mb-4">
            <Space wrap>
              {allowedActions.includes('assign') && (
                <Button type="primary" icon={<UserSwitchOutlined />} onClick={() => setAssignOpen(true)}>
                  {status === RepairStatus.ASSIGNED ? t('service.reassign') : t('service.assign')}
                </Button>
              )}
              {allowedActions.includes('progress') && (
                <Button icon={<ToolOutlined />} onClick={() => setProgressOpen(true)}>
                  {t('service.updateProgress')}
                </Button>
              )}
              {allowedActions.includes('complete') && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setCompleteOpen(true)}>
                  {t('service.markComplete')}
                </Button>
              )}
            </Space>
          </div>

          <div className="flex gap-6">
            <div className="min-w-0 flex-1 space-y-4">
              <Card size="small">
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label={t('service.repairNo')}>{repair.orderNo}</Descriptions.Item>
                  <Descriptions.Item label={t('service.repairType')}>
                    <Tag>{RepairTypeLabelKeys[repair.category as keyof typeof RepairTypeLabelKeys] ? t(RepairTypeLabelKeys[repair.category as keyof typeof RepairTypeLabelKeys]) : repair.category}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('service.description')} span={2}>{repair.description}</Descriptions.Item>
                  <Descriptions.Item label={t('service.renter')}>{repair.renterProfile?.name ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('service.engineer')}>{latestAssignment?.assignee?.realName ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('service.submittedAt')}>{formatDateTime(repair.createdAt)}</Descriptions.Item>
                  <Descriptions.Item label={t('service.assignedAt')}>{latestAssignment ? formatDateTime(latestAssignment.createdAt) : '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('service.completedAt')}>
                    {(repair.status === RepairStatus.COMPLETED || repair.status === RepairStatus.RATED) && lastProgress
                      ? formatDateTime(lastProgress.createdAt)
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('service.rating')}>
                    {repair.rating ? `速度 ${repair.rating.speedScore} · 质量 ${repair.rating.qualityScore}` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('service.ratingComment')} span={2}>{repair.rating?.comment ?? '-'}</Descriptions.Item>
                </Descriptions>
              </Card>

              <RepairMessageList repairId={id} />
            </div>

            <div className="w-[280px] shrink-0">
              <Card title={t('service.processTimeline')} size="small">
                {timelineItems.length > 0 ? (
                  <Timeline
                    items={timelineItems.map((item) => ({
                      color: item.color,
                      dot: item.icon,
                      children: (
                        <div>
                          <div className="font-medium">{item.label}</div>
                          {item.meta && <div className="text-xs text-text-secondary">{item.meta}</div>}
                          <div className="text-xs text-text-tertiary">{formatDateTime(item.createdAt)}</div>
                          {item.remark && <div className="mt-1 text-xs text-text-secondary">{item.remark}</div>}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <div className="py-4 text-center text-text-tertiary">
                    <ClockCircleOutlined /> {t('service.noTimeline')}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <AssignModal open={assignOpen} repairId={id} onClose={() => setAssignOpen(false)} onSuccess={handleSuccess} />
          <ProgressModal open={progressOpen} repairId={id} onClose={() => setProgressOpen(false)} onSuccess={handleSuccess} />
          <CompleteModal open={completeOpen} repairId={id} onClose={() => setCompleteOpen(false)} onSuccess={handleSuccess} />
        </>
      )}
    </Modal>
  );
}
