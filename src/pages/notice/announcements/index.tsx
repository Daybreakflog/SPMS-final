import { useState } from 'react';
import { Button, Form, Input, Space, Tag, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { announcementService } from '@/services/announcement.service';
import { RoleCode } from '@/types/enums';
import type { Announcement, AnnouncementListParams } from '@/types';
import { formatDateTime } from '@/utils/format';
import { getMessageApi } from '@/utils/antd';
import AnnouncementFormDrawer from './components/AnnouncementFormDrawer';

const MANAGE_ROLES: RoleCode[] = [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS];

export default function AnnouncementListPage() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | undefined>();

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<Announcement, AnnouncementListParams>({
      queryKey: 'announcements',
      queryFn: (params) => announcementService.list(params),
      defaultFilter: {} as AnnouncementListParams,
    });

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
    const isDraft = !record.publishedAt;

    return (
      <PermissionGuard roles={MANAGE_ROLES}>
        <Space size="small">
          {isDraft ? (
            <>
              <Button key="edit" type="link" size="small" onClick={() => handleEdit(record)}>
                {t('common.edit')}
              </Button>
              <Button key="publish" type="link" size="small" onClick={() => handlePublish(record)}>
                {t('announcement.publish')}
              </Button>
              <Button key="delete" type="link" size="small" danger onClick={() => handleDelete(record)}>
                {t('common.delete')}
              </Button>
            </>
          ) : (
            <Button key="archive" type="link" size="small" onClick={() => handleArchive(record)}>
              {t('announcement.archive')}
            </Button>
          )}
        </Space>
      </PermissionGuard>
    );
  };

  const columns: TableColumnsType<Announcement> = [
    { title: t('announcement.announcementTitle'), dataIndex: 'title', width: 240, ellipsis: true },
    {
      title: t('announcement.scope'),
      key: 'project',
      width: 160,
      render: (_, record) => record.project?.name ?? '-',
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 100,
      render: (_, record) => (record.publishedAt ? <Tag color="green">{t('announcement.statusPublished', { defaultValue: '已发布' })}</Tag> : <Tag>{t('announcement.statusDraft', { defaultValue: '草稿' })}</Tag>),
    },
    {
      title: t('announcement.publishedAt'),
      dataIndex: 'publishedAt',
      width: 160,
      render: (v: string | null) => v ? formatDateTime(v) : '-',
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

      <SearchFilterBar<AnnouncementListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('announcement.keyword')}>
          <Input placeholder={t('announcement.keywordPlaceholder')} allowClear />
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
