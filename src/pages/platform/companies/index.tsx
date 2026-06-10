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
import { companyService } from '@/services/company.service';
import { formatDateTime } from '@/utils/format';
import { RoleCode } from '@/types/enums';
import type { Company, CompanyListParams } from '@/types';
import CompanyFormDrawer from './components/CompanyFormDrawer';
import CompanyDetailModal from './detail';

export default function CompanyListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Company, CompanyListParams>({
      queryKey: 'companies',
      queryFn: companyService.list,
    });

  const handleEdit = (record: Company) => {
    setEditingCompany(record);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await companyService.remove(id);
    refetch();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingCompany(null);
  };

  const handleDrawerSuccess = () => {
    handleDrawerClose();
    refetch();
  };

  const columns: TableColumnsType<Company> = [
    { title: '公司名称', dataIndex: 'name', width: 200 },
    { title: '公司编号', dataIndex: 'code', width: 140 },
    { title: '联系人', dataIndex: 'contact', width: 100 },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    { title: '项目数', key: 'projectCount', width: 80, align: 'center', render: (_, r) => r._count?.projects ?? r.projectCount ?? 0 },
    { title: '员工数', key: 'staffCount', width: 80, align: 'center', render: (_, r) => r._count?.users ?? r.staffCount ?? 0 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => setDetailId(record.id)}>
            {t('common.detail')}
          </Button>
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN]}>
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
        title="物业公司管理"
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('common.create')}
            </Button>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<CompanyListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="name" label="公司名称">
          <Input placeholder="请输入公司名称" allowClear />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Company>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <CompanyDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      <CompanyFormDrawer
        open={drawerOpen}
        editingCompany={editingCompany}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
