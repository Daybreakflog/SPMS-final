import { Layout, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
import { clearTokens } from '@/api/token';
import { authService } from '@/services/auth.service';
import ThemeSettings from '@/components/ThemeSettings';
import NotificationCenter from '@/components/NotificationCenter';

const { Header } = Layout;

export default function HeaderBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const collapsed = useMenuStore((s) => s.collapsed);
  const toggleCollapsed = useMenuStore((s) => s.toggleCollapsed);
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      clearUser();
      navigate('/auth/staff/login', { replace: true });
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

        <NotificationCenter />

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
