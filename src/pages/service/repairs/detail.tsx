import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Spin, Timeline, Button, Space, Card, Tag } from 'antd';
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
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import { repairService } from '@/services/repair.service';
import { formatDateTime } from '@/utils/format';
import { RepairStatusMeta, RepairActionMatrix, RepairActionRoles, RepairTypeLabelKeys, UrgencyLabelKeys, UrgencyColors } from '@/constants/status';
import { RepairStatus } from '@/types/enums';
import type { RoleCode } from '@/types/enums';
import type { RepairAction } from '@/constants/status';
import { useUserStore } from '@/store/user.store';
import AssignModal from './components/AssignModal';
import ProgressModal from './components/ProgressModal';
import CompleteModal from './components/CompleteModal';
import RepairMessageList from './components/RepairMessageList';

const actionLabelMap: Record<string, string> = {
  SUBMIT: 'service.actionSubmit',
  ASSIGN: 'service.actionAssign',
  PROGRESS: 'service.actionProgress',
  COMPLETE: 'service.actionComplete',
  RATE: 'service.actionRate',
};

const actionColorMap: Record<string, string> = {
  SUBMIT: 'blue',
  ASSIGN: 'cyan',
  PROGRESS: 'orange',
  COMPLETE: 'green',
  RATE: 'gold',
};

const actionIconMap: Record<string, React.ReactNode> = {
  SUBMIT: <SendOutlined />,
  ASSIGN: <UserSwitchOutlined />,
  PROGRESS: <ToolOutlined />,
  COMPLETE: <CheckCircleOutlined />,
  RATE: <StarOutlined />,
};

export default function RepairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  const { data: repair, isLoading, refetch } = useQuery({
    queryKey: ['repair-detail', id],
    queryFn: () => repairService.detail(id!),
    enabled: !!id,
  });

  const [assignOpen, setAssignOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!repair) {
    return <div className="text-center text-text-tertiary">{t('common.noData')}</div>;
  }

  const status = repair.status as RepairStatus;
  const allowedActions = (RepairActionMatrix[status] ?? []).filter((action: RepairAction) => {
    const requiredRoles = RepairActionRoles[action];
    return requiredRoles.some((r: RoleCode) => userRoles.includes(r));
  });

  const handleSuccess = () => {
    setAssignOpen(false);
    setProgressOpen(false);
    setCompleteOpen(false);
    refetch();
  };

  return (
    <div>
      <PageHeader
        title={repair.repairNo}
        subtitle={repair.title}
        showBack
        extra={<StatusTag status={status} statusMap={RepairStatusMeta} />}
      />

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
        <div className="flex-1 min-w-0 space-y-4">
          <Card size="small">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label={t('service.repairNo')}>{repair.repairNo}</Descriptions.Item>
              <Descriptions.Item label={t('service.title')}>{repair.title}</Descriptions.Item>
              <Descriptions.Item label={t('service.description')} span={2}>{repair.description}</Descriptions.Item>
              <Descriptions.Item label={t('service.repairType')}>
                <Tag>{RepairTypeLabelKeys[repair.repairType as keyof typeof RepairTypeLabelKeys] ? t(RepairTypeLabelKeys[repair.repairType as keyof typeof RepairTypeLabelKeys]) : repair.repairType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('service.urgency')}>
                <Tag color={UrgencyColors[repair.urgency as keyof typeof UrgencyColors]}>{UrgencyLabelKeys[repair.urgency as keyof typeof UrgencyLabelKeys] ? t(UrgencyLabelKeys[repair.urgency as keyof typeof UrgencyLabelKeys]) : repair.urgency}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('service.renter')}>{repair.renterName}</Descriptions.Item>
              <Descriptions.Item label={t('service.unit')}>{repair.unitNumber}</Descriptions.Item>
              <Descriptions.Item label={t('service.engineer')}>{repair.engineerName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label={t('service.submittedAt')}>{formatDateTime(repair.submittedAt)}</Descriptions.Item>
              <Descriptions.Item label={t('service.assignedAt')}>{repair.assignedAt ? formatDateTime(repair.assignedAt) : '-'}</Descriptions.Item>
              <Descriptions.Item label={t('service.completedAt')}>{repair.completedAt ? formatDateTime(repair.completedAt) : '-'}</Descriptions.Item>
              <Descriptions.Item label={t('service.rating')}>{repair.rating ? `${repair.rating}分` : '-'}</Descriptions.Item>
              <Descriptions.Item label={t('service.ratingComment')}>{repair.ratingComment ?? '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <RepairMessageList repairId={id!} />
        </div>

        <div className="w-[300px] flex-shrink-0">
          <Card title={t('service.processTimeline')} size="small" className="sticky top-4">
            {(repair.timeline ?? []).length > 0 ? (
              <Timeline
                items={(repair.timeline ?? []).map((record) => ({
                  color: actionColorMap[record.action] ?? 'blue',
                  icon: actionIconMap[record.action] ?? <ClockCircleOutlined />,
                  content: (
                    <div>
                      <div className="font-medium">{t(actionLabelMap[record.action] ?? record.action)}</div>
                      <div className="text-xs text-text-secondary">{record.operatorName}</div>
                      <div className="text-xs text-text-tertiary">{formatDateTime(record.createdAt)}</div>
                      {record.remark && <div className="mt-1 text-xs text-text-secondary">{record.remark}</div>}
                    </div>
                  ),
                }))}
              />
            ) : (
              <div className="text-center text-text-tertiary py-4">{t('service.noTimeline')}</div>
            )}
          </Card>
        </div>
      </div>

      <AssignModal open={assignOpen} repairId={id!} onClose={() => setAssignOpen(false)} onSuccess={handleSuccess} />
      <ProgressModal open={progressOpen} repairId={id!} onClose={() => setProgressOpen(false)} onSuccess={handleSuccess} />
      <CompleteModal open={completeOpen} repairId={id!} onClose={() => setCompleteOpen(false)} onSuccess={handleSuccess} />
    </div>
  );
}
