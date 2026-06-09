import { useState } from 'react';
import { Modal, Descriptions, Tabs, Spin, Button, Space, Empty, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  EditOutlined,
  SendOutlined,
  StopOutlined,
  SyncOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import FileUpload from '@/components/FileUpload';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';
import { repairService } from '@/services/repair.service';
import PermissionGuard from '@/components/PermissionGuard';
import { formatDate, formatDateTime } from '@/utils/format';
import { ContractStatusMeta, ContractActionMatrix, ContractActionRoles, PaymentCycleLabelKeys, BillStatusMeta, RepairStatusMeta } from '@/constants/status';
import { ContractStatus, PaymentCycle, BillStatus, RepairStatus, RoleCode } from '@/types/enums';
import type { Bill, RepairOrder } from '@/types';
import type { ContractAction } from '@/constants/status';
import { useUserStore } from '@/store/user.store';
import { getMessageApi } from '@/utils/antd';
import { printElementById } from '@/utils/print';
import { STALE_TIME } from '@/constants/queryConfig';
import ApprovalModal from './components/ApprovalModal';
import RenewDrawer from './components/RenewDrawer';
import ContractFormDrawer from './components/ContractFormDrawer';
import BillDetailModal from '@/pages/billing/bills/detail';
import RepairDetailModal from '@/pages/service/repairs/detail';

function RelatedBills({ unitId, onViewBill }: { unitId: string; onViewBill: (id: string) => void }) {
  const { t } = useTranslation();
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
        {
          title: t('billing.billNo'), dataIndex: 'billNo',
          render: (v: string, r: Bill) => (
            <Button type="link" size="small" className="p-0" onClick={() => onViewBill(r.id)}>{v}</Button>
          ),
        },
        { title: t('billing.feeItem'), dataIndex: 'feeItemName' },
        { title: t('billing.period'), dataIndex: 'period' },
        { title: t('billing.amount'), dataIndex: 'amount', render: (v: number) => <MoneyDisplay value={v} /> },
        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as BillStatus} statusMap={BillStatusMeta} /> },
      ]}
      onRow={(record) => ({ onClick: () => onViewBill(record.id), className: 'cursor-pointer' })}
    />
  );
}

function RelatedRepairs({ unitId, onViewRepair }: { unitId: string; onViewRepair: (id: string) => void }) {
  const { t } = useTranslation();
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
        {
          title: t('service.repairNo'), dataIndex: 'repairNo',
          render: (v: string, r: RepairOrder) => (
            <Button type="link" size="small" className="p-0" onClick={() => onViewRepair(r.id)}>{v}</Button>
          ),
        },
        { title: t('service.title'), dataIndex: 'title' },
        { title: t('service.urgency'), dataIndex: 'urgency' },
        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as RepairStatus} statusMap={RepairStatusMeta} /> },
      ]}
      onRow={(record) => ({ onClick: () => onViewRepair(record.id), className: 'cursor-pointer' })}
    />
  );
}

function ContractAttachments({ contractId, attachments, readOnly = false }: { contractId: string; attachments: string[]; readOnly?: boolean }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<string[]>(attachments);

  const handleChange = async (urls: string[]) => {
    setFiles(urls);
    await contractService.update(contractId, { attachmentUrl: urls.join(',') });
    getMessageApi()?.success(t('common.operationSuccess'));
  };

  return (
    <div className="py-2">
      <FileUpload value={files} onChange={readOnly ? undefined : handleChange} maxCount={10} disabled={readOnly} />
      {files.length === 0 && <div className="mt-3 text-text-tertiary">{t('upload.empty')}</div>}
    </div>
  );
}

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function ContractDetailModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();
  const userRoles = useUserStore((s) => s.user?.roles) ?? [];

  const { data: contract, isLoading, refetch } = useQuery({
    queryKey: ['contract-detail', id],
    queryFn: () => contractService.detail(id),
    enabled: !!id && open,
    staleTime: STALE_TIME.DETAIL,
  });

  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | 'sign' | 'terminate' | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [billDetailId, setBillDetailId] = useState('');
  const [repairDetailId, setRepairDetailId] = useState('');

  const status = contract?.status as ContractStatus;
  const allowedActions = contract
    ? (ContractActionMatrix[status] ?? []).filter((action: ContractAction) => {
        const requiredRoles = ContractActionRoles[action];
        return requiredRoles.some((r: RoleCode) => userRoles.includes(r));
      })
    : [];

  const handleSubmit = async () => {
    if (!contract) return;
    await contractService.submit(contract.id);
    getMessageApi()?.success(t('contract.submitSuccess'));
    refetch();
  };

  const handleDelete = async () => {
    if (!contract) return;
    await contractService.remove(contract.id);
    getMessageApi()?.success(t('contract.deleteSuccess'));
    onClose();
  };

  const handleApprovalConfirm = async (data: { remark?: string; reason?: string }) => {
    if (!approvalType || !contract) return;
    const actions = {
      approve: () => contractService.financeApprove(contract.id, { comment: data.remark }),
      reject: () => contractService.financeReject(contract.id, { comment: data.reason }),
      sign: () => contractService.adminSign(contract.id, { comment: data.remark }),
      terminate: () => contractService.terminate(contract.id, { comment: data.reason }),
    };
    await actions[approvalType]();
    const successMsgMap = { approve: 'approveSuccess', reject: 'rejectSuccess', sign: 'signSuccess', terminate: 'terminateSuccess' };
    getMessageApi()?.success(t(`contract.${successMsgMap[approvalType]}`));
    refetch();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        contract ? (
          <Space>
            <span>{contract.contractNo}</span>
            <StatusTag status={status} statusMap={ContractStatusMeta} />
          </Space>
        ) : '合同详情'
      }
      footer={null}
      width={1100}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !contract ? (
        <div className="py-8 text-center text-text-tertiary">合同不存在</div>
      ) : (
        <>
          <div className="no-print mb-4 flex items-center justify-between">
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
            <Button icon={<PrinterOutlined />} onClick={() => printElementById('contract-print-area', contract.contractNo)}>
              {t('common.print')}
            </Button>
          </div>

          <div id="contract-print-area">
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
                      <Descriptions.Item label={t('contract.renter')}>{contract.renterProfile?.name ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('contract.unit')}>{contract.unit?.name ?? contract.unit?.code ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('contract.project')}>{contract.project?.name ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('contract.startDate')}>{formatDate(contract.startDate)}</Descriptions.Item>
                      <Descriptions.Item label={t('contract.endDate')}>{formatDate(contract.endDate)}</Descriptions.Item>
                      <Descriptions.Item label={t('contract.monthlyRent')}>
                        <MoneyDisplay value={Number(contract.rentAmount)} />
                      </Descriptions.Item>
                      <Descriptions.Item label={t('contract.deposit')}>
                        <MoneyDisplay value={Number(contract.depositAmount)} />
                      </Descriptions.Item>
                      <Descriptions.Item label={t('contract.paymentCycle')}>
                        {PaymentCycleLabelKeys[contract.paymentMethod as PaymentCycle] ? t(PaymentCycleLabelKeys[contract.paymentMethod as PaymentCycle]) : contract.paymentMethod}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('contract.remark')} span={2}>{contract.terms ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label={t('common.createdAt')}>{formatDateTime(contract.createdAt)}</Descriptions.Item>
                      <Descriptions.Item label={t('common.updatedAt')}>{formatDateTime(contract.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'bills',
                  label: t('contract.relatedBills'),
                  children: contract.unitId
                    ? <RelatedBills unitId={contract.unitId} onViewBill={setBillDetailId} />
                    : <Empty description={t('common.noData')} />,
                },
                {
                  key: 'repairs',
                  label: t('contract.relatedRepairs'),
                  children: contract.unitId
                    ? <RelatedRepairs unitId={contract.unitId} onViewRepair={setRepairDetailId} />
                    : <Empty description={t('common.noData')} />,
                },
                {
                  key: 'attachments',
                  label: t('contract.attachments'),
                  children: (
                    <PermissionGuard
                      roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}
                      fallback={
                        <ContractAttachments
                          contractId={contract.id}
                          attachments={contract.attachmentUrl ? contract.attachmentUrl.split(',').filter(Boolean) : []}
                          readOnly
                        />
                      }
                    >
                      <ContractAttachments
                        contractId={contract.id}
                        attachments={contract.attachmentUrl ? contract.attachmentUrl.split(',').filter(Boolean) : []}
                      />
                    </PermissionGuard>
                  ),
                },
              ]}
            />
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
          <BillDetailModal open={!!billDetailId} id={billDetailId} onClose={() => setBillDetailId('')} />
          <RepairDetailModal open={!!repairDetailId} id={repairDetailId} onClose={() => setRepairDetailId('')} />
        </>
      )}
    </Modal>
  );
}
