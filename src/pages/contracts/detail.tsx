import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Descriptions, Tabs, Spin, Timeline, Button, Space, Card, Table, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SendOutlined,
  StopOutlined,
  SyncOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';
import { repairService } from '@/services/repair.service';
import { formatDate, formatDateTime } from '@/utils/format';
import { ContractStatusMeta, ContractActionMatrix, ContractActionRoles, PaymentCycleLabelKeys, BillStatusMeta, RepairStatusMeta } from '@/constants/status';
import { ContractStatus, PaymentCycle, BillStatus, RepairStatus } from '@/types/enums';
import type { RoleCode } from '@/types/enums';
import type { ContractApprovalRecord, Bill, RepairOrder } from '@/types';
import type { ContractAction } from '@/constants/status';
import { useUserStore } from '@/store/user.store';
import { getMessageApi } from '@/utils/antd';
import { printElementById } from '@/utils/print';
import { STALE_TIME } from '@/constants/queryConfig';
import ApprovalModal from './components/ApprovalModal';
import RenewDrawer from './components/RenewDrawer';
import ContractFormDrawer from './components/ContractFormDrawer';

function RelatedBills({ unitId }: { unitId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['contract-related-bills', unitId],
    queryFn: () => billingService.billList({ unitId, page: 1, pageSize: 50 } as never),
    enabled: !!unitId,
  });
  const bills = (data as { items?: Bill[] })?.items ?? [];
  if (isLoading) return <Spin className="flex justify-center py-8" />;
  if (bills.length === 0) return <Empty description={t('common.noData')} />;
  return (
    <Table
      dataSource={bills}
      rowKey="id"
      size="small"
      pagination={false}
      columns={[
        { title: t('billing.billNo'), dataIndex: 'billNo', render: (v: string, r: Bill) => <Link to={`/billing/bills/${r.id}`}>{v}</Link> },
        { title: t('billing.feeItem'), dataIndex: 'feeItemName' },
        { title: t('billing.period'), dataIndex: 'period' },
        { title: t('billing.amount'), dataIndex: 'amount', render: (v: number) => <MoneyDisplay value={v} /> },
        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as BillStatus} statusMap={BillStatusMeta} /> },
      ]}
      onRow={(record) => ({ onClick: () => navigate(`/billing/bills/${record.id}`), className: 'cursor-pointer' })}
    />
  );
}

function RelatedRepairs({ unitId }: { unitId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['contract-related-repairs', unitId],
    queryFn: () => repairService.list({ unitId, page: 1, pageSize: 50 } as never),
    enabled: !!unitId,
  });
  const repairs = (data as { items?: RepairOrder[] })?.items ?? [];
  if (isLoading) return <Spin className="flex justify-center py-8" />;
  if (repairs.length === 0) return <Empty description={t('common.noData')} />;
  return (
    <Table
      dataSource={repairs}
      rowKey="id"
      size="small"
      pagination={false}
      columns={[
        { title: t('service.repairNo'), dataIndex: 'repairNo', render: (v: string, r: RepairOrder) => <Link to={`/service/repairs/${r.id}`}>{v}</Link> },
        { title: t('service.title'), dataIndex: 'title' },
        { title: t('service.urgency'), dataIndex: 'urgency' },
        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as RepairStatus} statusMap={RepairStatusMeta} /> },
      ]}
      onRow={(record) => ({ onClick: () => navigate(`/service/repairs/${record.id}`), className: 'cursor-pointer' })}
    />
  );
}

const actionLabelMap: Record<string, string> = {
  CREATE: 'contract.actionCreate',
  SUBMIT: 'contract.actionSubmit',
  FINANCE_APPROVE: 'contract.actionFinanceApprove',
  FINANCE_REJECT: 'contract.actionFinanceReject',
  ADMIN_SIGN: 'contract.actionAdminSign',
  ADMIN_REJECT: 'contract.actionAdminReject',
  TERMINATE: 'contract.actionTerminate',
};

const actionColorMap: Record<string, string> = {
  CREATE: 'blue',
  SUBMIT: 'blue',
  FINANCE_APPROVE: 'green',
  FINANCE_REJECT: 'red',
  ADMIN_SIGN: 'green',
  ADMIN_REJECT: 'red',
  TERMINATE: 'gray',
};

const actionIconMap: Record<string, React.ReactNode> = {
  CREATE: <EditOutlined />,
  SUBMIT: <SendOutlined />,
  FINANCE_APPROVE: <CheckCircleOutlined />,
  FINANCE_REJECT: <CloseCircleOutlined />,
  ADMIN_SIGN: <CheckCircleOutlined />,
  ADMIN_REJECT: <CloseCircleOutlined />,
  TERMINATE: <StopOutlined />,
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  const { data: contract, isLoading, refetch } = useQuery({
    queryKey: ['contract-detail', id],
    queryFn: () => contractService.detail(id!),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
  });

  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | 'sign' | 'terminate' | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!contract) {
    return <div className="text-center text-text-tertiary">合同不存在</div>;
  }

  const status = contract.status as ContractStatus;
  const allowedActions = (ContractActionMatrix[status] ?? []).filter((action: ContractAction) => {
    const requiredRoles = ContractActionRoles[action];
    return requiredRoles.some((r: RoleCode) => userRoles.includes(r));
  });

  const handleSubmit = async () => {
    await contractService.submit(contract.id);
    getMessageApi()?.success(t('contract.submitSuccess'));
    refetch();
  };

  const handleDelete = async () => {
    await contractService.remove(contract.id);
    getMessageApi()?.success(t('contract.deleteSuccess'));
    navigate('/contracts');
  };

  const handleApprovalConfirm = async (data: { remark?: string; reason?: string }) => {
    if (!approvalType) return;
    const actions = {
      approve: () => contractService.financeApprove(contract.id, { remark: data.remark }),
      reject: () => contractService.financeReject(contract.id, { reason: data.reason! }),
      sign: () => contractService.adminSign(contract.id, { remark: data.remark }),
      terminate: () => contractService.terminate(contract.id, { reason: data.reason! }),
    };
    await actions[approvalType]();
    const successMsgMap = { approve: 'approveSuccess', reject: 'rejectSuccess', sign: 'signSuccess', terminate: 'terminateSuccess' };
    getMessageApi()?.success(t(`contract.${successMsgMap[approvalType]}`));
    refetch();
  };

  const actionButtons = (
    <Space wrap>
      {allowedActions.includes('edit') && (
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
          {t('common.edit')}
        </Button>
      )}
      {allowedActions.includes('submit') && (
        <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
          {t('contract.submit')}
        </Button>
      )}
      {allowedActions.includes('financeApprove') && (
        <Button type="primary" onClick={() => setApprovalType('approve')}>
          {t('contract.financeApprove')}
        </Button>
      )}
      {allowedActions.includes('financeReject') && (
        <Button danger onClick={() => setApprovalType('reject')}>
          {t('contract.financeReject')}
        </Button>
      )}
      {allowedActions.includes('adminSign') && (
        <Button type="primary" onClick={() => setApprovalType('sign')}>
          {t('contract.adminSign')}
        </Button>
      )}
      {allowedActions.includes('adminReject') && (
        <Button danger onClick={() => setApprovalType('reject')}>
          {t('contract.adminReject')}
        </Button>
      )}
      {allowedActions.includes('renew') && (
        <Button icon={<SyncOutlined />} onClick={() => setRenewOpen(true)}>
          {t('contract.renew')}
        </Button>
      )}
      {allowedActions.includes('terminate') && (
        <Button danger icon={<StopOutlined />} onClick={() => setApprovalType('terminate')}>
          {t('contract.terminate')}
        </Button>
      )}
      {allowedActions.includes('delete') && (
        <Button danger onClick={handleDelete}>
          {t('common.delete')}
        </Button>
      )}
    </Space>
  );

  const approvalTimeline = (
    <Card title={t('contract.approvalTimeline')} size="small" className="sticky top-4">
      <Timeline
        items={(contract.approvalRecords ?? []).map((record: ContractApprovalRecord) => ({
          color: actionColorMap[record.action] ?? 'blue',
          dot: actionIconMap[record.action] ?? <ClockCircleOutlined />,
          children: (
            <div>
              <div className="font-medium">{t(actionLabelMap[record.action] ?? record.action)}</div>
              <div className="text-xs text-text-secondary">{record.operatorName}</div>
              <div className="text-xs text-text-tertiary">{formatDateTime(record.createdAt)}</div>
              {record.remark && <div className="mt-1 text-xs text-text-secondary">{record.remark}</div>}
            </div>
          ),
        }))}
      />
    </Card>
  );

  return (
    <div>
      <PageHeader
        title={`${contract.contractNo}`}
        subtitle={contract.renterName}
        showBack
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={() => printElementById('contract-print-area', contract.contractNo)}>
              {t('common.print')}
            </Button>
            <StatusTag status={status} statusMap={ContractStatusMeta} />
          </Space>
        }
      />

      <div className="mb-4 no-print">{actionButtons}</div>

      <div id="contract-print-area" className="flex gap-6">
        <div className="flex-1 min-w-0">
          <Tabs
            items={[
              {
                key: 'terms',
                label: t('contract.contractTerms'),
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label={t('contract.contractNo')}>{contract.contractNo}</Descriptions.Item>
                    <Descriptions.Item label={t('common.status')}>
                      <StatusTag status={status} statusMap={ContractStatusMeta} />
                    </Descriptions.Item>
                    <Descriptions.Item label={t('contract.renter')}>{contract.renterName}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.renterIdNumber')}>{contract.renterIdNumber ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.unit')}>{contract.unitNumber}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.building')}>{contract.buildingName ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.project')}>{contract.projectName ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.startDate')}>{formatDate(contract.startDate)}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.endDate')}>{formatDate(contract.endDate)}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.monthlyRent')}>
                      <MoneyDisplay value={contract.monthlyRent} />
                    </Descriptions.Item>
                    <Descriptions.Item label={t('contract.deposit')}>
                      <MoneyDisplay value={contract.deposit} />
                    </Descriptions.Item>
                    <Descriptions.Item label={t('contract.paymentCycle')}>
                      {PaymentCycleLabelKeys[contract.paymentCycle as PaymentCycle] ? t(PaymentCycleLabelKeys[contract.paymentCycle as PaymentCycle]) : contract.paymentCycle}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('contract.creator')}>{contract.creatorName ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('contract.remark')} span={2}>{contract.remark ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('common.createdAt')}>{formatDateTime(contract.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label={t('common.updatedAt')}>{formatDateTime(contract.updatedAt)}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'bills',
                label: t('contract.relatedBills'),
                children: <RelatedBills unitId={contract.unitId} />,
              },
              {
                key: 'repairs',
                label: t('contract.relatedRepairs'),
                children: <RelatedRepairs unitId={contract.unitId} />,
              },
              {
                key: 'attachments',
                label: t('contract.attachments'),
                children: <div className="flex h-32 items-center justify-center text-text-tertiary">附件 — 待后续 Sprint 实现</div>,
              },
              {
                key: 'log',
                label: t('contract.operationLog'),
                children: <div className="flex h-32 items-center justify-center text-text-tertiary">操作日志 — 待后续 Sprint 实现</div>,
              },
            ]}
          />
        </div>

        <div className="w-[300px] flex-shrink-0">
          {approvalTimeline}
        </div>
      </div>

      <ApprovalModal
        open={!!approvalType}
        type={approvalType ?? 'approve'}
        onClose={() => setApprovalType(null)}
        onConfirm={handleApprovalConfirm}
      />

      <RenewDrawer
        open={renewOpen}
        contract={contract}
        onClose={() => setRenewOpen(false)}
        onSuccess={() => { setRenewOpen(false); refetch(); }}
      />

      <ContractFormDrawer
        open={editOpen}
        contract={contract}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); refetch(); }}
      />
    </div>
  );
}
