import { useMemo, useState } from 'react';
import { Badge, Button, Popover, Tabs, List, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { formatDateTime } from '@/utils/format';
import type { Notification } from '@/types';

export default function NotificationCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const { data: listData, isLoading } = useQuery({
    queryKey: ['notification-list'],
    queryFn: () => notificationService.list({ page: 1, pageSize: 10 }),
  });

  const allItems = listData?.items ?? [];
  const unread = allItems.filter((n) => !n.read).length;

  const items = useMemo(() => {
    const list = tab === 'unread' ? allItems.filter((n) => !n.read) : allItems;
    return [...list].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allItems, tab]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notification-list'] });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.read(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.readAll(),
    onSuccess: invalidate,
  });

  const handleItemClick = (item: Notification) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.targetUrl) {
      setOpen(false);
      navigate(item.targetUrl);
    }
  };

  const listContent = (
    <Spin spinning={isLoading}>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('notification.empty')} className="py-6" />
      ) : (
        <List<Notification>
          dataSource={items}
          className="max-h-96 overflow-y-auto"
          renderItem={(item) => (
            <List.Item
              className="cursor-pointer px-3 hover:bg-fill-quaternary"
              onClick={() => handleItemClick(item)}
              actions={
                item.read
                  ? []
                  : [
                      <Button
                        key="read"
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        aria-label={t('notification.markRead')}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead.mutate(item.id);
                        }}
                      />,
                    ]
              }
            >
              <List.Item.Meta
                title={
                  <span className="flex items-center gap-2">
                    <span className={item.read ? 'text-sm text-text-secondary' : 'text-sm font-medium'}>
                      {item.title}
                    </span>
                    {!item.read && <Badge status="processing" />}
                  </span>
                }
                description={
                  <div>
                    <div className="text-xs">{item.content}</div>
                    <div className="mt-1 text-xs text-text-tertiary">{formatDateTime(item.createdAt)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Spin>
  );

  const content = (
    <div style={{ width: 360 }}>
      <Tabs
        size="small"
        activeKey={tab}
        onChange={(k) => setTab(k as 'all' | 'unread')}
        items={[
          { key: 'all', label: t('notification.all'), children: listContent },
          { key: 'unread', label: t('notification.unread'), children: listContent },
        ]}
      />
      <div className="flex items-center justify-end pt-2">
        <Button
          type="link"
          size="small"
          disabled={unread === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          {t('notification.markAllRead')}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      content={content}
      title={t('notification.center')}
    >
      <Badge count={unread} size="small">
        <Button type="text" icon={<BellOutlined />} aria-label={t('notification.center')} />
      </Badge>
    </Popover>
  );
}
