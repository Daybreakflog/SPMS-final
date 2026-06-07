import { useState } from 'react';
import { Button, Form, Input, Select, Space, Tabs, Tag, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { announcementService } from '@/services/announcement.service';
import { AnnouncementStatusMeta, AnnouncementStatusTabKeys, AnnouncementTypeLabelKeys, AnnouncementScopeLabelKeys } from '@/constants/status';
import { AnnouncementStatus, AnnouncementType, AnnouncementScope, RoleCode } from '@/types/enums';
import type { Announcement, AnnouncementListParams } from '@/types';
import { formatDateTime } from '@/utils/format';
import { getMessageApi } from '@/utils/antd';
import AnnouncementFormDrawer from './components/AnnouncementFormDrawer';

const MANAGE_ROLES: RoleCode[] = [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS];

export default function AnnouncementListPage() {
  const { t } = useTranslation();
  const [statusTab, setStatusTab] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | undefined>();

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Announcement, AnnouncementListParams>({
      queryKey: `announcements-${statusTab}`,
      queryFn: (params) => announcementService.list({ ...params, status: statusTab || undefined }),
      defaultFilter: {} as AnnouncementListParams,
    });

  const handleTabChange = (key: string) => {
    setStatusTab(key);
    onReset();
  };

  const handleEdit = (record: Announcement) => {
    setEditingItem(record);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(undefined);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    setDrawerOpen(false);
    setEditingItem(undefined);
    refetch();
  };

  const handlePublish = (record: Announcement) => {
    Modal.confirm({
      title: t('announcement.publishConfirm'),
      onOk: async () => {
        await announcementService.publish(record.id);
        getMessageApi()?.success(t('announcement.publishSuccess'));
        refetch();
      },
    });
  };

  const handleArchive = (record: Announcement) => {
    Modal.confirm({
      title: t('announcement.archiveConfirm'),
      onOk: async () => {
        await announcementService.archive(record.id);
        getMessageApi()?.success(t('announcement.archiveSuccess'));
        refetch();
      },
    });
  };

  const handleDelete = (record: Announcement) => {
    Modal.confirm({
      title: t('common.deleteConfirm'),
      onOk: async () => {
        await announcementService.remove(record.id);
        getMessageApi()?.success(t('announcement.deleteSuccess'));
        refetch();
      },
    });
  };

  const renderActions = (_: unknown, record: Announcement) => {
    const buttons: React.ReactNode[] = [];

    if (record.status === AnnouncementStatus.DRAFT) {
      buttons.push(
        <Button key="edit" type="link" size="small" onClick={() => handleEdit(record)}>
          {t('common.edit')}
        </Button>,
        <Button key="publish" type="link" size="small" onClick={() => handlePublish(record)}>
          {t('announcement.publish')}
        </Button>,
        <Button key="delete" type="link" size="small" danger onClick={() => handleDelete(record)}>
          {t('common.delete')}
        </Button>,
      );
    } else if (record.status === AnnouncementStatus.PUBLISHED) {
      buttons.push(
        <Button key="archive" type="link" size="small" onClick={() => handleArchive(record)}>
          {t('announcement.archive')}
        </Button>,
      );
    } else if (record.status === AnnouncementStatus.ARCHIVED) {
      buttons.push(
        <Button key="delete" type="link" size="small" danger onClick={() => handleDelete(record)}>
          {t('common.delete')}
        </Button>,
      );
    }

    return <Space size="small">{buttons}</Space>;
  };

  const columns: TableColumnsType<Announcement> = [
    { title: t('announcement.announcementTitle'), dataIndex: 'title', width: 200, ellipsis: true },
    {
      title: t('announcement.type'),
      dataIndex: 'type',
      width: 80,
      render: (v: string) => <Tag>{AnnouncementTypeLabelKeys[v as AnnouncementType] ? t(AnnouncementTypeLabelKeys[v as AnnouncementType]) : v}</Tag>,
    },
    {
      title: t('announcement.scope'),
      dataIndex: 'scope',
      width: 100,
      render: (v: string, record: Announcement) =>
        v === AnnouncementScope.PROJECT
          ? record.projectNames?.join(', ') || t(AnnouncementScopeLabelKeys[v as AnnouncementScope])
          : AnnouncementScopeLabelKeys[v as AnnouncementScope] ? t(AnnouncementScopeLabelKeys[v as AnnouncementScope]) : v,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 90,
      render: (v: AnnouncementStatus) => <StatusTag status={v} statusMap={AnnouncementStatusMeta} />,
    },
    {
      title: t('announcement.publisher'),
      dataIndex: 'publisherName',
      width: 80,
      render: (v: string) => v || '-',
    },
    {
      title: t('announcement.publishedAt'),
      dataIndex: 'publishedAt',
      width: 160,
      render: (v: string) => v ? formatDateTime(v) : '-',
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 180,
      render: renderActions,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('announcement.title')}
        extra={
          <PermissionGuard roles={MANAGE_ROLES}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('common.create')}
            </Button>
          </PermissionGuard>
        }
      />

      <Tabs
        activeKey={statusTab}
        onChange={handleTabChange}
        items={AnnouncementStatusTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <SearchFilterBar<AnnouncementListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('announcement.keyword')}>
          <Input placeholder={t('announcement.keywordPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="type" label={t('announcement.type')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 120 }}>
            {Object.entries(AnnouncementTypeLabelKeys).map(([key, labelKey]) => (
              <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<Announcement>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <AnnouncementFormDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingItem(undefined); }}
        onSuccess={handleDrawerSuccess}
        editingItem={editingItem}
      />
    </div>
  );
}
