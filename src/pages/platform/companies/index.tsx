import { useState } from 'react';
import { Button, Form, Input, Select, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import { useTableQuery } from '@/hooks/useTableQuery';
import { companyService } from '@/services/company.service';
import { formatDateTime } from '@/utils/format';
import type { Company, CompanyListParams } from '@/types';
import CompanyFormDrawer from './components/CompanyFormDrawer';

export default function CompanyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

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
    { title: '社会信用代码', dataIndex: 'creditCode', width: 180 },
    { title: '联系人', dataIndex: 'contactPerson', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', width: 130 },
    { title: '项目数', dataIndex: 'projectCount', width: 80, align: 'center' },
    { title: '员工数', dataIndex: 'staffCount', width: 80, align: 'center' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/platform/companies/${record.id}`)}>
            {t('common.detail')}
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm title={t('common.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="物业公司管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('common.create')}
          </Button>
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
        <Form.Item name="creditCode" label="社会信用代码">
          <Input placeholder="请输入社会信用代码" allowClear />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="ACTIVE">启用</Select.Option>
            <Select.Option value="DISABLED">禁用</Select.Option>
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

      <CompanyFormDrawer
        open={drawerOpen}
        editingCompany={editingCompany}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
