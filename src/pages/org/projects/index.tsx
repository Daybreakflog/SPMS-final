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
import { projectService } from '@/services/project.service';
import { formatDateTime } from '@/utils/format';
import { RoleCode } from '@/types/enums';
import type { Project, ProjectListParams } from '@/types';
import { isProjectActive } from '@/types';
import ProjectFormDrawer from './components/ProjectFormDrawer';
import ProjectDetailModal from './detail';

export default function ProjectListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Project, ProjectListParams>({
      queryKey: 'projects',
      queryFn: projectService.list,
    });

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await projectService.remove(id);
    refetch();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingProject(null);
  };

  const handleDrawerSuccess = () => {
    handleDrawerClose();
    refetch();
  };

  const columns: TableColumnsType<Project> = [
    { title: '项目名称', dataIndex: 'name', width: 180 },
    {
      title: '所属公司',
      key: 'companyName',
      width: 180,
      render: (_, r) => r.company?.name ?? r.companyName ?? '-',
    },
    { title: '楼栋数', dataIndex: 'buildingCount', width: 80, align: 'center', render: (v: number) => v ?? '-' },
    { title: '单元总数', dataIndex: 'unitCount', width: 90, align: 'center', render: (v: number) => v ?? '-' },
    {
      title: '入住率',
      dataIndex: 'occupancyRate',
      width: 90,
      align: 'center',
      render: (v: number) => (v != null ? `${v}%` : '-'),
    },
    { title: '项目负责人', dataIndex: 'manager', width: 110, render: (v: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: Project['status']) => (
        <Tag color={isProjectActive(status) ? 'green' : 'default'}>
          {isProjectActive(status) ? '启用' : '禁用'}
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
        title="项目管理"
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('common.create')}
            </Button>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<ProjectListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label="项目名称">
          <Input placeholder="请输入项目名称" allowClear />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value={1}>启用</Select.Option>
            <Select.Option value={0}>禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Project>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <ProjectDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      <ProjectFormDrawer
        open={drawerOpen}
        editingProject={editingProject}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
