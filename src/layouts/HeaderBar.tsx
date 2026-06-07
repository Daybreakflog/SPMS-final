import { useEffect, useRef } from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Badge, theme, List, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMenuStore } from '@/store/menu.store';
import { useUserStore } from '@/store/user.store';
import { useThemeStore } from '@/store/theme.store';
import { useNotificationStore } from '@/store/notification.store';
import type { RealtimeNotification } from '@/store/notification.store';
import { clearTokens } from '@/api/token';
import { authService } from '@/services/auth.service';
import { getMessageApi } from '@/utils/antd';
import ThemeSettings from '@/components/ThemeSettings';

const { Header } = Layout;

const mockPushMessages: Omit<RealtimeNotification, 'id' | 'createdAt'>[] = [
  { title: '新报修工单', content: '租户提交了水管漏水报修', type: 'REPAIR', targetUrl: '/service/repairs' },
  { title: '账单逾期提醒', content: '有3条账单已逾期超过7天', type: 'BILLING', targetUrl: '/billing/bills' },
  { title: '合同待审批', content: '新合同 HT-2025-0099 待审批', type: 'CONTRACT', targetUrl: '/contracts' },
  { title: '系统通知', content: '系统将于今晚维护升级', type: 'SYSTEM' },
  { title: '支付成功', content: '租户张伟已完成缴费 ¥3,500', type: 'BILLING', targetUrl: '/billing/payments' },
];

export default function HeaderBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const collapsed = useMenuStore((s) => s.collapsed);
  const toggleCollapsed = useMenuStore((s) => s.toggleCollapsed);
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const recentMessages = useNotificationStore((s) => s.recentMessages);
  const pushMessage = useNotificationStore((s) => s.pushMessage);

  const pushIndexRef = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const msg = mockPushMessages[pushIndexRef.current % mockPushMessages.length];
      pushMessage({
        ...msg,
        id: `push-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      getMessageApi()?.info({ content: `${msg.title}: ${msg.content}`, duration: 3 });
      pushIndexRef.current++;
    }, 30000);
    return () => clearInterval(timer);
  }, [pushMessage]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      clearUser();
      navigate('/login', { replace: true });
    }
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('app.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="floating-header flex items-center justify-between"
      style={{
        padding: '0 20px',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      />

      <Space size="middle">
        <Button
          type="text"
          icon={<GlobalOutlined />}
          onClick={() => {
            const next = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
            document.documentElement.style.transition = 'opacity 0.15s ease';
            document.documentElement.style.opacity = '0.6';
            i18n.changeLanguage(next).then(() => {
              requestAnimationFrame(() => {
                document.documentElement.style.opacity = '1';
                setTimeout(() => { document.documentElement.style.transition = ''; }, 200);
              });
            });
          }}
          aria-label={t('common.language')}
        >
          {t('common.switchLang')}
        </Button>

        <Button
          type="text"
          icon={themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        />

        <ThemeSettings />

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          popupRender={() => (
            <div style={{ background: token.colorBgContainer, borderRadius: 8, boxShadow: token.boxShadowSecondary, width: 320, border: `1px solid ${token.colorBorderSecondary}` }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                <Typography.Text strong>{t('notification.recentMessages')}</Typography.Text>
                <Badge count={unreadCount} size="small" />
              </div>
              {recentMessages.length === 0 ? (
                <div className="py-6 text-center text-sm text-text-tertiary">{t('notification.noMessages')}</div>
              ) : (
                <List
                  dataSource={recentMessages}
                  renderItem={(item) => (
                    <List.Item
                      className="cursor-pointer px-4 hover:bg-fill-quaternary"
                      onClick={() => { if (item.targetUrl) navigate(item.targetUrl); }}
                    >
                      <List.Item.Meta title={<span className="text-sm">{item.title}</span>} description={<span className="text-xs">{item.content}</span>} />
                    </List.Item>
                  )}
                />
              )}
              <div className="px-4 py-2 text-center" style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                <Button type="link" size="small" onClick={() => navigate('/notice/notifications')}>
                  {t('notification.viewAll')}
                </Button>
              </div>
            </div>
          )}
        >
          <Badge count={unreadCount} size="small">
            <Button type="text" icon={<BellOutlined />} aria-label="Notifications" />
          </Badge>
        </Dropdown>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space className="cursor-pointer">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.realName ?? user?.username ?? '-'}</span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
