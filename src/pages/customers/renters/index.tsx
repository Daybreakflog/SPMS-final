import { useState } from 'react';
import { Button, Form, Input, Select, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, ImportOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { renterService } from '@/services/renter.service';
import { formatDateTime } from '@/utils/format';
import { maskPhone, maskIdCard } from '@/utils/mask';
import { IdTypeLabelKeys } from '@/constants/status';
import { RoleCode } from '@/types/enums';
import type { Renter, RenterListParams } from '@/types';
import ImportWizard from '@/components/ImportWizard';
import type { ImportResult } from '@/components/ImportWizard';
import RenterFormDrawer from './components/RenterFormDrawer';
import RenterDetailModal from './detail';

export default function RenterListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingRenter, setEditingRenter] = useState<Renter | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Renter, RenterListParams>({
      queryKey: 'renters',
      queryFn: renterService.list,
    });

  const handleEdit = (record: Renter) => {
    setEditingRenter(record);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingRenter(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    await renterService.remove(id);
    refetch();
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingRenter(null);
  };

  const handleDrawerSuccess = () => {
    handleDrawerClose();
    refetch();
  };

  const columns: TableColumnsType<Renter> = [
    { title: t('renter.name'), dataIndex: 'name', width: 100 },
    {
      title: t('renter.gender'),
      dataIndex: 'gender',
      width: 60,
      render: (v: string) => (v === 'MALE' ? '男' : v === 'FEMALE' ? '女' : '-'),
    },
    {
      title: t('renter.phone'),
      dataIndex: 'phone',
      width: 130,
      render: (v: string) => maskPhone(v),
    },
    {
      title: t('renter.idType'),
      dataIndex: 'idType',
      width: 80,
      render: (v: string) => IdTypeLabelKeys[v as keyof typeof IdTypeLabelKeys] ? t(IdTypeLabelKeys[v as keyof typeof IdTypeLabelKeys]) : v,
    },
    {
      title: t('renter.idNumber'),
      dataIndex: 'idNumber',
      width: 180,
      render: (v: string) => maskIdCard(v),
    },
    {
      title: t('renter.currentUnit'),
      dataIndex: 'currentUnit',
      width: 120,
      render: (v: string) => v || '-',
    },
    {
      title: t('renter.accountStatus'),
      dataIndex: 'accountStatus',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>
          {v === 'ACTIVE' ? '已开通' : '未开通'}
        </Tag>
      ),
    },
    {
      title: t('common.createdAt'),
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
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
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
        title={t('renter.title')}
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
            <Space>
              <Button icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
                {t('common.import')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                {t('common.create')}
              </Button>
            </Space>
          </PermissionGuard>
        }
      />

      <SearchFilterBar<RenterListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('renter.keyword')}>
          <Input placeholder={t('renter.keywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="bindStatus" label={t('renter.bindStatus')}>
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="BOUND">已绑定</Select.Option>
            <Select.Option value="UNBOUND">未绑定</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Renter>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <RenterDetailModal open={!!detailId} id={detailId ?? ''} onClose={() => setDetailId(null)} />

      {importOpen && (
        <ImportWizard
          templateName="renter_import_template.xlsx"
          columns={[
            { field: 'name', label: t('renter.name'), required: true },
            { field: 'phone', label: t('renter.phone'), required: true },
            { field: 'idType', label: t('renter.idType') },
            { field: 'idNumber', label: t('renter.idNumber') },
          ]}
          onDownloadTemplate={() => {}}
          onImport={async () => {
            const res: ImportResult = { success: 10, failed: 0 };
            setImportOpen(false);
            refetch();
            return res;
          }}
        />
      )}

      <RenterFormDrawer
        open={drawerOpen}
        editingRenter={editingRenter}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
