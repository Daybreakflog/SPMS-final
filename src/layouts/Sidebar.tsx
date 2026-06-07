import { useMemo, useEffect, useState } from 'react';
import { Layout, Menu, Badge, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMenuStore } from '@/store/menu.store';
import { useUserStore } from '@/store/user.store';
import { useNotificationStore } from '@/store/notification.store';
import { menuConfig, type MenuItemConfig } from '@/router/routes.config';

const { Sider } = Layout;
const MOBILE_BREAKPOINT = 768;

type AntMenuItem = NonNullable<MenuProps['items']>[number];

function filterByRole(items: MenuItemConfig[], userRoles: string[]): MenuItemConfig[] {
  return items.reduce<MenuItemConfig[]>((acc, item) => {
    if (item.roles && !item.roles.some((r) => userRoles.includes(r))) {
      return acc;
    }
    const filtered = { ...item };
    if (filtered.children) {
      filtered.children = filterByRole(filtered.children, userRoles);
      if (filtered.children.length === 0) return acc;
    }
    acc.push(filtered);
    return acc;
  }, []);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const collapsed = useMenuStore((s) => s.collapsed);
  const openKeys = useMenuStore((s) => s.openKeys);
  const setOpenKeys = useMenuStore((s) => s.setOpenKeys);
  const toggleCollapsed = useMenuStore((s) => s.toggleCollapsed);
  const userRoles = useUserStore((s) => s.user?.roles ?? []);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const filteredMenu = useMemo(() => filterByRole(menuConfig, userRoles), [userRoles]);

  const menuItems: AntMenuItem[] = useMemo(() => {
    const buildItems = (items: MenuItemConfig[]): AntMenuItem[] =>
      items.map((item) => {
        let label: React.ReactNode = t(item.i18nKey);
        if (item.badge && unreadCount > 0) {
          label = (
            <span className="flex items-center justify-between">
              {t(item.i18nKey)}
              <Badge count={unreadCount} size="small" />
            </span>
          );
        }

        if (item.children) {
          return {
            key: item.key,
            icon: item.icon,
            label: t(item.i18nKey),
            children: buildItems(item.children),
          };
        }

        return {
          key: item.path ?? item.key,
          icon: item.icon,
          label,
        };
      });

    return buildItems(filteredMenu);
  }, [filteredMenu, t, unreadCount]);

  const selectedKey = useMemo(() => {
    const findPath = (items: MenuItemConfig[]): string | undefined => {
      for (const item of items) {
        if (item.path && location.pathname.startsWith(item.path)) {
          return item.path;
        }
        if (item.children) {
          const found = findPath(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findPath(menuConfig) ?? '/dashboard';
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    if (isMobile) toggleCollapsed();
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const logoBlock = (
    <div className="flex h-16 items-center justify-center px-4">
      <h1 className="m-0 bg-gradient-to-r from-primary to-[#722ed1] bg-clip-text text-base font-bold text-transparent">
        {collapsed && !isMobile ? 'SP' : t('app.title')}
      </h1>
    </div>
  );

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      openKeys={collapsed && !isMobile ? [] : openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuClick}
      items={menuItems}
      className="flex-1 overflow-auto"
    />
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={!collapsed}
        onClose={toggleCollapsed}
        styles={{
          body: { padding: 0, background: 'var(--app-bg-container)' },
          header: { display: 'none' },
          wrapper: { width: 240 },
        }}
      >
        {logoBlock}
        {menu}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={232}
      className="floating-sider"
      style={{ height: 'calc(100vh - 24px)' }}
      role="navigation"
      aria-label={t('menu.dashboard')}
    >
      {logoBlock}
      {menu}
    </Sider>
  );
}
