import { useState } from 'react';
import { Button, Tabs, Badge, Modal, Pagination, Space, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { notificationService } from '@/services/notification.service';
import { useNotificationStore } from '@/store/notification.store';
import { NotificationTypeTabKeys } from '@/constants/status';
import { STALE_TIME } from '@/constants/queryConfig';
import { getMessageApi } from '@/utils/antd';
import type { Notification, PageResult } from '@/types';

export default function NotificationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount, decrement, clearAll } = useNotificationStore();
  const queryClient = useQueryClient();

  const [typeTab, setTypeTab] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const queryKey = ['notifications', typeTab, page, pageSize];

  const { data: queryResult, isLoading: loading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, unknown> = { page, pageSize };
      if (typeTab) params.type = typeTab;
      const res = await notificationService.list(params as Parameters<typeof notificationService.list>[0]);
      if ('unreadCount' in res) {
        setUnreadCount((res as unknown as { unreadCount: number }).unreadCount);
      }
      return res;
    },
    staleTime: STALE_TIME.REALTIME,
  });

  const data = queryResult?.items ?? [];
  const total = queryResult?.total ?? 0;

  const handleTabChange = (key: string) => {
    setTypeTab(key);
    setPage(1);
  };

  const handleClick = async (item: Notification) => {
    if (!item.read) {
      // 乐观更新：立即在缓存中将该条标记为已读并减少未读数
      queryClient.setQueryData<PageResult<Notification>>(queryKey, (prev) =>
        prev
          ? { ...prev, items: prev.items.map((n) => (n.id === item.id ? { ...n, read: true } : n)) }
          : prev,
      );
      decrement();
      try {
        await notificationService.read(item.id);
      } catch {
        // 失败回滚：重新拉取真实状态
        refetch();
      }
    }
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  const handleReadAll = () => {
    Modal.confirm({
      title: t('notification.readAllConfirm'),
      onOk: async () => {
        await notificationService.readAll();
        clearAll();
        getMessageApi()?.success(t('notification.readAllSuccess'));
        refetch();
      },
    });
  };

  return (
    <div>
      <PageHeader
        title={t('notification.title')}
        extra={
          <Space>
            <Badge count={unreadCount} overflowCount={99}>
              <span className="text-sm text-gray-500">
                {t('notification.unreadCount', { count: unreadCount })}
              </span>
            </Badge>
            <Button icon={<CheckOutlined />} onClick={handleReadAll} disabled={unreadCount === 0}>
              {t('notification.readAll')}
            </Button>
          </Space>
        }
      />

      <Tabs
        activeKey={typeTab}
        onChange={handleTabChange}
        items={NotificationTypeTabKeys.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="mb-4"
      />

      <Spin spinning={loading}>
        <div className="divide-y divide-border">
          {data.length === 0 && !loading && (
            <div className="py-12 text-center text-text-tertiary">{t('notification.noMessages')}</div>
          )}
          {data.map((item: Notification) => (
            <div
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-fill-quaternary ${!item.read ? 'bg-primary-bg' : ''}`}
              onClick={() => handleClick(item)}
            >
              <div className="min-w-0 flex-1">
                <div className={`text-sm ${!item.read ? 'font-semibold' : ''}`}>{item.title}</div>
                <div className="mt-1 text-sm text-text-secondary line-clamp-2">{item.content}</div>
                <div className="mt-1 text-xs text-text-tertiary">
                  {new Date(item.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              {!item.read && (
                <span className="mt-2 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" title={t('notification.unread')} />
              )}
            </div>
          ))}
        </div>
      </Spin>

      {total > pageSize && (
        <div className="mt-4 flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            showTotal={(t) => `共 ${t} 条`}
          />
        </div>
      )}
    </div>
  );
}
