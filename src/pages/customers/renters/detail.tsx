import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Tabs, Tag, Spin, Button, Modal, Form, Input, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { UserAddOutlined, KeyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { renterService } from '@/services/renter.service';
import { formatDateTime } from '@/utils/format';
import { maskIdCard, maskPhone } from '@/utils/mask';
import { IdTypeLabelKeys, GenderLabelKeys } from '@/constants/status';
import { RoleCode } from '@/types/enums';
import type { RenterAccount } from '@/types';
import { getMessageApi } from '@/utils/antd';
import TenantAppPreview from './components/TenantAppPreview';

export default function RenterDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: renterData, isLoading, refetch } = useQuery({
    queryKey: ['renter-detail', id],
    queryFn: async () => {
      const [renter, accounts] = await Promise.all([
        renterService.detail(id!),
        renterService.getAccounts(id!),
      ]);
      return { renter, accounts };
    },
    enabled: !!id,
  });

  const renter = renterData?.renter ?? null;
  const accounts = renterData?.accounts ?? [];

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [accountForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const handleCreateAccount = async () => {
    try {
      const values = await accountForm.validateFields();
      setSubmitting(true);
      await renterService.createAccount(id!, values);
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

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!renter) {
    return <div className="text-center text-text-tertiary">租户不存在</div>;
  }

  const accountColumns = [
    { title: '用户名', dataIndex: 'username', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v === 'ACTIVE' ? '已启用' : '已禁用'}</Tag>,
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
    <div>
      <PageHeader title={renter.name} subtitle="租户详情" showBack />

      <Tabs
        items={[
          {
            key: 'info',
            label: '基础信息',
            children: (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="姓名">{renter.name}</Descriptions.Item>
                <Descriptions.Item label="性别">{GenderLabelKeys[renter.gender as keyof typeof GenderLabelKeys] ? t(GenderLabelKeys[renter.gender as keyof typeof GenderLabelKeys]) : '-'}</Descriptions.Item>
                <Descriptions.Item label="出生日期">{renter.birthDate ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="证件类型">{IdTypeLabelKeys[renter.idType as keyof typeof IdTypeLabelKeys] ? t(IdTypeLabelKeys[renter.idType as keyof typeof IdTypeLabelKeys]) : renter.idType}</Descriptions.Item>
                <Descriptions.Item label="证件号码">{maskIdCard(renter.idNumber)}</Descriptions.Item>
                <Descriptions.Item label="手机号">{maskPhone(renter.phone)}</Descriptions.Item>
                <Descriptions.Item label="备用手机">{renter.phoneAlt ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{renter.email ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="紧急联系人">{renter.emergencyContact ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="工作单位">{renter.company ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="职务">{renter.position ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="备注">{renter.remark ?? '-'}</Descriptions.Item>
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
            key: 'units',
            label: '房源',
            children: (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">当前房源：</p>
                {renter.currentUnit ? (
                  <Tag color="blue">{renter.currentProjectName} - {renter.currentUnit}</Tag>
                ) : (
                  <span className="text-text-tertiary">暂无绑定房源</span>
                )}
              </div>
            ),
          },
          {
            key: 'contracts',
            label: '合同',
            children: <div className="text-text-tertiary">合同列表 — Sprint 3 实现</div>,
          },
          {
            key: 'bills',
            label: '账单',
            children: <div className="text-text-tertiary">账单列表 — Sprint 4 实现</div>,
          },
          {
            key: 'service',
            label: '报修投诉',
            children: <div className="text-text-tertiary">报修投诉记录 — Sprint 5 实现</div>,
          },
          {
            key: 'app-preview',
            label: t('tenantApp.tabLabel'),
            children: <TenantAppPreview renter={renter} />,
          },
        ]}
      />

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
    </div>
  );
}
