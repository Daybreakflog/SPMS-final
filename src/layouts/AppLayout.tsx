import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Layout, FloatButton } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ToolOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import Breadcrumb from './Breadcrumb';
import RouteLoading from '@/components/RouteLoading';
import OfflineBar from '@/components/OfflineBar';
import FeedbackWidget from '@/components/FeedbackWidget';
import GlobalSearch from '@/components/GlobalSearch';
import AppTour from '@/components/AppTour';
import { useAppTour } from '@/components/AppTour/useAppTour';
import { useMenuStore } from '@/store/menu.store';
import { useUserStore } from '@/store/user.store';
import { RoleCode } from '@/types/enums';
import { trackRouteChange } from '@/utils/performance';

const { Content } = Layout;
const MOBILE_BP = 768;

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const h = (e: MediaQueryListEvent) => setM(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return m;
}

function usePullToRefresh(containerRef: React.RefObject<HTMLElement | null>) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    const diff = e.changedTouches[0].clientY - startY.current;
    if (diff > 80) {
      setRefreshing(true);
      window.location.reload();
    }
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [containerRef, onTouchStart, onTouchEnd]);

  return refreshing;
}

const ALL_BOTTOM_TABS = [
  { key: '/dashboard', icon: <DashboardOutlined />, labelKey: 'menu.dashboard' },
  { key: '/contracts', icon: <FileTextOutlined />, labelKey: 'menu.contracts' },
  { key: '/service/repairs', icon: <ToolOutlined />, labelKey: 'menu.service' },
  { key: '/system/audit-logs', icon: <SettingOutlined />, labelKey: 'menu.system', roles: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS] as RoleCode[] },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tour = useAppTour();
  const isMobile = useIsMobile();
  const toggleCollapsed = useMenuStore((s) => s.toggleCollapsed);
  const contentRef = useRef<HTMLElement>(null);
  const userRoles = useUserStore((s) => s.user?.roles ?? []);

  usePullToRefresh(contentRef);

  useEffect(() => {
    trackRouteChange(location.pathname);
  }, [location.pathname]);

  const bottomTabs = ALL_BOTTOM_TABS.filter((tab) => !tab.roles || tab.roles.some((r) => userRoles.includes(r)));
  const activeTab = bottomTabs.find((tab) => location.pathname.startsWith(tab.key))?.key ?? '/dashboard';

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout className="flex flex-col">
        <OfflineBar />
        <HeaderBar />
        <Content
          id="main-content"
          ref={contentRef}
          className={`floating-content-wrap flex-1 overflow-auto ${isMobile ? 'pb-16' : ''}`}
          role="main"
        >
          <Breadcrumb />
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
          <FloatButton.BackTop target={() => document.getElementById('main-content') || window} visibilityHeight={300} />
          <FeedbackWidget />
          <GlobalSearch />
          <AppTour open={tour.open} onFinish={tour.finish} />
        </Content>

        {isMobile && (
          <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t border-border bg-bg-container shadow-md">
            {bottomTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(tab.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition-colors ${
                  activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {tab.icon}
                <span>{t(tab.labelKey)}</span>
              </button>
            ))}
            <button
              onClick={toggleCollapsed}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 text-xs text-text-secondary"
            >
              <MenuOutlined />
              <span>{t('common.more')}</span>
            </button>
          </nav>
        )}
      </Layout>
    </Layout>
  );
}
