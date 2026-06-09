import { useState } from 'react';
import { Modal, Descriptions, Spin, Button, Space, Card, Tag, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleOutlined, SearchOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import StatusTag from '@/components/StatusTag';
import { complaintService } from '@/services/complaint.service';
import { formatDateTime } from '@/utils/format';
import { ComplaintStatusMeta, ComplaintActionMatrix, ComplaintActionRoles, ComplaintTargetTypeLabelKeys, SeverityLabelKeys, SeverityColors, AppealStatusMeta } from '@/constants/status';
import { ComplaintStatus, AppealStatus } from '@/types/enums';
import type { RoleCode } from '@/types/enums';
import type { ComplaintAppeal } from '@/types';
import type { ComplaintAction } from '@/constants/status';
import { useUserStore } from '@/store/user.store';
import AnalysisModal from './components/AnalysisModal';
import AppealModal from './components/AppealModal';
import AppealResolveModal from './components/AppealResolveModal';
import CloseModal from './components/CloseModal';

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function ComplaintDetailModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  const { data: complaint, isLoading, refetch } = useQuery({
    queryKey: ['complaint-detail', id],
    queryFn: () => complaintService.detail(id),
    enabled: !!id && open,
  });

  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState('');
  const [closeOpen, setCloseOpen] = useState(false);

  const handleSuccess = () => {
    setAnalysisOpen(false);
    setAppealOpen(false);
    setResolveOpen(false);
    setCloseOpen(false);
    refetch();
  };

  const status = complaint?.status as ComplaintStatus;
  const allowedActions = complaint
    ? (ComplaintActionMatrix[status] ?? []).filter((action: ComplaintAction) => {
        const requiredRoles = ComplaintActionRoles[action];
        return requiredRoles.some((r: RoleCode) => userRoles.includes(r));
      })
    : [];

  const pendingAppeals = (complaint?.appeals ?? []).filter((a) => a.status === 'PENDING');

  const handleResolveAppeal = (appealId: string) => {
    setSelectedAppealId(appealId);
    setResolveOpen(true);
  };

  const appealColumns: TableColumnsType<ComplaintAppeal> = [
    { title: t('service.appealerName'), dataIndex: 'appealerName', width: 100 },
    { title: t('service.reason'), dataIndex: 'reason', width: 200, ellipsis: true },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 90,
      render: (v: AppealStatus) => <StatusTag status={v} statusMap={AppealStatusMeta} />,
    },
    {
      title: t('service.opinion'),
      dataIndex: 'resolveOpinion',
      width: 200,
      render: (v: string) => v || '-',
      ellipsis: true,
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: t('common.operation'),
      key: 'action',
      width: 100,
      render: (_, record) => (
        record.status === 'PENDING' && allowedActions.includes('resolveAppeal') ? (
          <Button type="link" size="small" onClick={() => handleResolveAppeal(record.id)}>
            {t('service.resolveAppeal')}
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        complaint ? (
          <Space>
            <span>{complaint.complaintNo}</span>
            <StatusTag status={status} statusMap={ComplaintStatusMeta} />
          </Space>
        ) : '投诉详情'
      }
      footer={null}
      width={1000}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !complaint ? (
        <div className="py-8 text-center text-text-tertiary">{t('common.noData')}</div>
      ) : (
        <>
          <div className="mb-4">
            <Space wrap>
              {allowedActions.includes('analyze') && (
                <Button type="primary" icon={<SearchOutlined />} onClick={() => setAnalysisOpen(true)}>
                  {t('service.analyze')}
                </Button>
              )}
              {allowedActions.includes('appeal') && (
                <Button icon={<ExclamationCircleOutlined />} onClick={() => setAppealOpen(true)}>
                  {t('service.submitAppeal')}
                </Button>
              )}
              {allowedActions.includes('resolveAppeal') && pendingAppeals.length > 0 && (
                <Button icon={<CheckCircleOutlined />} onClick={() => handleResolveAppeal(pendingAppeals[0].id)}>
                  {t('service.resolveAppeal')}
                </Button>
              )}
              {allowedActions.includes('close') && (
                <Button danger icon={<CloseCircleOutlined />} onClick={() => setCloseOpen(true)}>
                  {t('service.closeComplaint')}
                </Button>
              )}
            </Space>
          </div>

          <div className="space-y-4">
            <Card size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label={t('service.complaintNo')}>{complaint.complaintNo}</Descriptions.Item>
                <Descriptions.Item label={t('service.title')}>{complaint.title}</Descriptions.Item>
                <Descriptions.Item label={t('service.description')} span={2}>{complaint.description}</Descriptions.Item>
                <Descriptions.Item label={t('service.complainant')}>{complaint.complainantName}</Descriptions.Item>
                <Descriptions.Item label={t('service.targetName')}>{complaint.targetName}</Descriptions.Item>
                <Descriptions.Item label={t('service.targetType')}>
                  <Tag>{ComplaintTargetTypeLabelKeys[complaint.targetType as keyof typeof ComplaintTargetTypeLabelKeys] ? t(ComplaintTargetTypeLabelKeys[complaint.targetType as keyof typeof ComplaintTargetTypeLabelKeys]) : complaint.targetType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('service.severity')}>
                  <Tag color={SeverityColors[complaint.severity]}>{SeverityLabelKeys[complaint.severity] ? t(SeverityLabelKeys[complaint.severity]) : complaint.severity}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('service.assignee')}>{complaint.assigneeName ?? '-'}</Descriptions.Item>
                <Descriptions.Item label={t('service.submittedAt')}>{formatDateTime(complaint.submittedAt)}</Descriptions.Item>
                {complaint.closedAt && (
                  <Descriptions.Item label={t('service.closedAt')}>{formatDateTime(complaint.closedAt)}</Descriptions.Item>
                )}
                {complaint.closedReason && (
                  <Descriptions.Item label={t('service.closedReason')} span={2}>{complaint.closedReason}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {complaint.analysis && (
              <Card title={t('service.analysisRecord')} size="small">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t('service.conclusion')}>{complaint.analysis.conclusion}</Descriptions.Item>
                  <Descriptions.Item label={t('service.responsibility')}>{complaint.analysis.responsibility}</Descriptions.Item>
                  <Descriptions.Item label={t('service.suggestion')}>{complaint.analysis.suggestion}</Descriptions.Item>
                  <Descriptions.Item label={t('service.resultField')}>{complaint.analysis.result}</Descriptions.Item>
                  <Descriptions.Item label={t('common.operation')}>
                    {complaint.analysis.operatorName} · {formatDateTime(complaint.analysis.createdAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {(complaint.appeals ?? []).length > 0 && (
              <Card title={t('service.appealRecords')} size="small">
                <Table<ComplaintAppeal>
                  columns={appealColumns}
                  dataSource={complaint.appeals}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            )}
          </div>

          <AnalysisModal open={analysisOpen} complaintId={id} onClose={() => setAnalysisOpen(false)} onSuccess={handleSuccess} />
          <AppealModal open={appealOpen} complaintId={id} onClose={() => setAppealOpen(false)} onSuccess={handleSuccess} />
          <AppealResolveModal open={resolveOpen} complaintId={id} appealId={selectedAppealId} onClose={() => setResolveOpen(false)} onSuccess={handleSuccess} />
          <CloseModal open={closeOpen} complaintId={id} onClose={() => setCloseOpen(false)} onSuccess={handleSuccess} />
        </>
      )}
    </Modal>
  );
}
