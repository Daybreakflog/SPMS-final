import { useState } from 'react';
import { Modal, Descriptions, Tabs, Tag, Spin, Button, Form, Input, Table, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { UserAddOutlined, KeyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PermissionGuard from '@/components/PermissionGuard';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import { renterService } from '@/services/renter.service';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';
import { repairService } from '@/services/repair.service';
import { complaintService } from '@/services/complaint.service';
import { formatDate, formatDateTime } from '@/utils/format';
import { maskIdCard, maskPhone } from '@/utils/mask';
import { ContractStatusMeta, BillStatusMeta, RepairStatusMeta, ComplaintStatusMeta } from '@/constants/status';
import { RoleCode, ContractStatus, BillStatus, RepairStatus, ComplaintStatus } from '@/types/enums';
import type { RenterAccount, Contract, Bill, RepairOrder, Complaint } from '@/types';
import { getMessageApi } from '@/utils/antd';
import TenantAppPreview from './components/TenantAppPreview';
import ContractDetailModal from '@/pages/contracts/detail';
import BillDetailModal from '@/pages/billing/bills/detail';
import RepairDetailModal from '@/pages/service/repairs/detail';

function RenterContracts({ renterId, onViewContract }: { renterId: string; onViewContract: (id: string) => void }) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['renter-contracts', renterId],
    queryFn: () => contractService.list({ renterProfileId: renterId, page: 1, pageSize: 50 }),
    enabled: !!renterId,
  });
  const contracts = data?.items ?? [];
  if (isLoading) return <Spin className="flex justify-center py-8" />;
  if (contracts.length === 0) return <Empty description={t('common.noData')} />;
  return (
    <Table<Contract>
      dataSource={contracts}
      rowKey="id"
      size="small"
      pagination={false}
      columns={[
        {
          title: t('contract.contractNo'), dataIndex: 'contractNo',
          render: (v: string, r: Contract) => (
            <Button type="link" size="small" className="p-0" onClick={() => onViewContract(r.id)}>{v}</Button>
          ),
        },
        { title: t('contract.unit'), dataIndex: 'unitNumber' },
        { title: t('contract.startDate'), dataIndex: 'startDate', render: (v: string) => formatDate(v) },
        { title: t('contract.endDate'), dataIndex: 'endDate', render: (v: string) => formatDate(v) },
        { title: t('contract.monthlyRent'), dataIndex: 'monthlyRent', render: (v: number) => <MoneyDisplay value={v} /> },
        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as ContractStatus} statusMap={ContractStatusMeta} /> },
      ]}
      onRow={(record) => ({ onClick: () => onViewContract(record.id), className: 'cursor-pointer' })}
    />
  );
}

function RenterBills({ renterId, onViewBill }: { renterId: string; onViewBill: (id: string) => void }) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['renter-bills', renterId],
    queryFn: () => billingService.billList({ renterProfileId: renterId, page: 1, pageSize: 50 }),
    enabled: !!renterId,
  });
  const bills = data?.items ?? [];
  if (isLoading) return <Spin className="flex justify-center py-8" />;
  if (bills.length === 0) return <Empty description={t('common.noData')} />;
  return (
    <Table<Bill>
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

function RenterServices({ renterId, onViewRepair }: { renterId: string; onViewRepair: (id: string) => void }) {
  const { t } = useTranslation();

  const { data: repairData, isLoading: repairLoading } = useQuery({
    queryKey: ['renter-repairs', renterId],
    queryFn: () => repairService.list({ renterId, page: 1, pageSize: 50 } as never),
    enabled: !!renterId,
  });
  const { data: complaintData, isLoading: complaintLoading } = useQuery({
    queryKey: ['renter-complaints', renterId],
    queryFn: () => complaintService.list({ renterId, page: 1, pageSize: 50 } as never),
    enabled: !!renterId,
  });

  const repairs = (repairData as { items?: RepairOrder[] })?.items ?? [];
  const complaints = (complaintData as { items?: Complaint[] })?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-medium">{t('service.repairTitle')}</h4>
        {repairLoading ? (
          <Spin className="flex justify-center py-4" />
        ) : repairs.length === 0 ? (
          <Empty description={t('common.noData')} />
        ) : (
          <Table<RepairOrder>
            dataSource={repairs}
            rowKey="id"
            size="small"
            pagination={false}
            columns={[
              {
                title: t('service.repairNo'), dataIndex: 'orderNo',
                render: (v: string, r: RepairOrder) => (
                  <Button type="link" size="small" className="p-0" onClick={() => onViewRepair(r.id)}>{v}</Button>
                ),
              },
              { title: t('service.title'), dataIndex: 'title' },
              { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as RepairStatus} statusMap={RepairStatusMeta} /> },
              { title: t('service.submittedAt'), dataIndex: 'createdAt', render: (v: string) => formatDateTime(v) },
            ]}
            onRow={(record) => ({ onClick: () => onViewRepair(record.id), className: 'cursor-pointer' })}
          />
        )}
      </div>
      <div>
        <h4 className="mb-2 font-medium">{t('service.complaintTitle')}</h4>
        {complaintLoading ? (
          <Spin className="flex justify-center py-4" />
        ) : complaints.length === 0 ? (
          <Empty description={t('common.noData')} />
        ) : (
          <Table<Complaint>
            dataSource={complaints}
            rowKey="id"
            size="small"
            pagination={false}
            columns={[
              { title: t('service.complaintNo'), dataIndex: 'complaintNo' },
              { title: t('service.title'), dataIndex: 'title' },
              { title: t('common.status'), dataIndex: 'status', render: (v: string) => <StatusTag status={v as ComplaintStatus} statusMap={ComplaintStatusMeta} /> },
              { title: t('service.submittedAt'), dataIndex: 'submittedAt', render: (v: string) => formatDateTime(v) },
            ]}
          />
        )}
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function RenterDetailModal({ open, id, onClose }: Props) {
  const { t } = useTranslation();

  const { data: renterData, isLoading, refetch } = useQuery({
    queryKey: ['renter-detail', id],
    queryFn: async () => {
      const [renter, accounts] = await Promise.all([
        renterService.detail(id),
        renterService.getAccounts(id),
      ]);
      return { renter, accounts };
    },
    enabled: !!id && open,
  });

  const renter = renterData?.renter ?? null;
  const accounts = renterData?.accounts ?? [];

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [accountForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const [contractDetailId, setContractDetailId] = useState('');
  const [billDetailId, setBillDetailId] = useState('');
  const [repairDetailId, setRepairDetailId] = useState('');

  const handleCreateAccount = async () => {
    try {
      const values = await accountForm.validateFields();
      setSubmitting(true);
      await renterService.createAccount(id, values);
      getMessageApi()?.success('账号创建成功');
      setAccountModalOpen(false);
      accountForm.resetFields();
      refetch();
    } catch {
      // validation
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setSubmitting(true);
      await renterService.resetPassword(selectedAccountId, values);
      getMessageApi()?.success('密码重置成功');
      setResetModalOpen(false);
      resetForm.resetFields();
    } catch {
      // validation
    } finally {
      setSubmitting(false);
    }
  };

  const accountColumns = [
    { title: '用户名', dataIndex: 'username', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'}>{v === 1 ? '已启用' : '已禁用'}</Tag>,
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginAt',
      width: 180,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: RenterAccount) => (
        <Button
          type="link"
          size="small"
          icon={<KeyOutlined />}
          onClick={() => {
            setSelectedAccountId(record.id);
            setResetModalOpen(true);
          }}
        >
          重置密码
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title={renter ? `${renter.name} - 租户详情` : '租户详情'}
        footer={null}
        width={1100}
        destroyOnClose
      >
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><Spin /></div>
        ) : !renter ? (
          <div className="py-8 text-center text-text-tertiary">租户不存在</div>
        ) : (
          <Tabs
            items={[
              {
                key: 'info',
                label: '基础信息',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="名称">{renter.name}</Descriptions.Item>
                    <Descriptions.Item label="类型">{renter.type === 'COMPANY' ? '企业' : '个人'}</Descriptions.Item>
                    <Descriptions.Item label="证件号码">{renter.idNumber ? maskIdCard(renter.idNumber) : '-'}</Descriptions.Item>
                    <Descriptions.Item label="统一社会信用代码">{renter.creditCode ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="联系人">{renter.contactName ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="手机号">{renter.phone ? maskPhone(renter.phone) : '-'}</Descriptions.Item>
                    <Descriptions.Item label="所属公司">{renter.company?.name ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>{renter.remark ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">{formatDateTime(renter.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{formatDateTime(renter.updatedAt)}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'accounts',
                label: '登录账号',
                children: (
                  <div>
                    <div className="mb-3 flex justify-end">
                      <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAccountModalOpen(true)}>
                          创建账号
                        </Button>
                      </PermissionGuard>
                    </div>
                    <Table
                      columns={accountColumns}
                      dataSource={accounts}
                      rowKey="id"
                      pagination={false}
                      size="middle"
                    />
                  </div>
                ),
              },
              {
                key: 'contracts',
                label: '合同',
                children: <RenterContracts renterId={renter.id} onViewContract={setContractDetailId} />,
              },
              {
                key: 'bills',
                label: '账单',
                children: <RenterBills renterId={renter.id} onViewBill={setBillDetailId} />,
              },
              {
                key: 'service',
                label: '报修投诉',
                children: <RenterServices renterId={renter.id} onViewRepair={setRepairDetailId} />,
              },
              {
                key: 'app-preview',
                label: t('tenantApp.tabLabel'),
                children: <TenantAppPreview renter={renter} />,
              },
            ]}
          />
        )}

        <Modal
          title="创建登录账号"
          open={accountModalOpen}
          onCancel={() => { setAccountModalOpen(false); accountForm.resetFields(); }}
          onOk={handleCreateAccount}
          confirmLoading={submitting}
        >
          <Form form={accountForm} layout="vertical">
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="请输入登录用户名" />
            </Form.Item>
            <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '请输入初始密码' }]}>
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="重置密码"
          open={resetModalOpen}
          onCancel={() => { setResetModalOpen(false); resetForm.resetFields(); }}
          onOk={handleResetPassword}
          confirmLoading={submitting}
        >
          <Form form={resetForm} layout="vertical">
            <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          </Form>
        </Modal>
      </Modal>

      <ContractDetailModal open={!!contractDetailId} id={contractDetailId} onClose={() => setContractDetailId('')} />
      <BillDetailModal open={!!billDetailId} id={billDetailId} onClose={() => setBillDetailId('')} />
      <RepairDetailModal open={!!repairDetailId} id={repairDetailId} onClose={() => setRepairDetailId('')} />
    </>
  );
}
