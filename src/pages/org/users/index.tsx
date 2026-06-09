import { useState } from 'react';
import { Button, Form, Input, Select, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { userService } from '@/services/user.service';
import { formatDateTime } from '@/utils/format';
import { RoleLabels, RoleColors, ALL_STAFF_ROLES } from '@/constants/roles';
import { normalizeRoles, normalizeUser } from '@/services/user.service';
import { RoleCode } from '@/types/enums';
import type { StaffUser, UserListParams } from '@/types';
import UserFormDrawer from './components/UserFormDrawer';
import UserDetailModal from './detail';

export default function UserListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<StaffUser, UserListParams>({
      queryKey: 'users',
      queryFn: userService.list,
    });

  const handleEdit = (record: StaffUser) => {
    setEditingUser(normalizeUser(record));
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await userService.remove(id);
    refetch();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingUser(null);
  };

  const handleDrawerSuccess = () => {
    handleDrawerClose();
    refetch();
  };

  const columns: TableColumnsType<StaffUser> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', width: 100 },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      render: (rawRoles: unknown[]) => (
        <Space size={4} wrap>
          {normalizeRoles(rawRoles as RoleCode[]).map((r) => (
            <Tag key={r} color={RoleColors[r]}>
              {RoleLabels[r] ?? (typeof r === 'string' ? r : String(r))}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
            {t('common.detail')}
          </Button>
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              {t('common.edit')}
            </Button>
            <Popconfirm title={t('common.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="员工管理"
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('common.create')}
            </Button>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<UserListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="用户名/姓名" allowClear />
        </Form.Item>
        <Form.Item name="roles" label="角色">
          <Select
            mode="multiple"
            placeholder="请选择角色"
            allowClear
            style={{ minWidth: 200 }}
            options={ALL_STAFF_ROLES.map((r) => ({ value: r, label: RoleLabels[r] }))}
          />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="ACTIVE">启用</Select.Option>
            <Select.Option value="DISABLED">禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<StaffUser>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <UserDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      <UserFormDrawer
        open={drawerOpen}
        editingUser={editingUser}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
