import type { ThemeConfig } from 'antd';

const RADIUS_XL   = 18;  // 大容器：Sidebar / Header
const RADIUS_LG   = 14;  // 卡片、弹窗、抽屉
const RADIUS_BASE = 10;  // 控件：按钮、输入框、Select
const RADIUS_SM   =  8;  // 小控件：Tag、Segmented

const PRIMARY_SHADOW = '0 6px 14px -8px rgba(22, 119, 255, 0.55)';

const lightShadow          = '0 6px 20px -10px rgba(15, 23, 42, 0.18), 0 2px 8px -2px rgba(15, 23, 42, 0.06)';
const lightShadowSecondary = '0 12px 32px -14px rgba(15, 23, 42, 0.22), 0 4px 10px -4px rgba(15, 23, 42, 0.08)';

const darkShadow           = '0 6px 20px -10px rgba(0, 0, 0, 0.55), 0 2px 8px -2px rgba(0, 0, 0, 0.35)';
const darkShadowSecondary  = '0 14px 32px -14px rgba(0, 0, 0, 0.65), 0 4px 10px -4px rgba(0, 0, 0, 0.35)';

const sharedComponents = (isDark: boolean): ThemeConfig['components'] => ({
  Layout: {
    siderBg: 'transparent',
    headerBg: 'transparent',
    bodyBg: 'transparent',
    headerHeight: 60,
    headerPadding: '0 20px',
  },
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
    itemSelectedBg: isDark ? 'rgba(22, 119, 255, 0.18)' : 'rgba(22, 119, 255, 0.08)',
    itemSelectedColor: isDark ? '#4096ff' : '#1677ff',
    itemHoverBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
    itemBorderRadius: RADIUS_BASE,
    itemMarginInline: 4,
  },
  Card: {
    ...(isDark ? { colorBgContainer: '#1a1f2e' } : {}),
    borderRadiusLG: RADIUS_LG,
    headerBg: 'transparent',
    paddingLG: 20,
  },
  Table: {
    headerBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.025)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
    headerSplitColor: 'transparent',
    borderRadius: RADIUS_LG,
    borderRadiusLG: RADIUS_LG,
  },
  Modal: {
    borderRadiusLG: RADIUS_LG,
    contentBg: isDark ? '#1a1f2e' : '#ffffff',
  },
  Drawer: { borderRadiusLG: RADIUS_LG },
  Button: {
    borderRadius: RADIUS_BASE,
    controlHeight: 36,
    primaryShadow: PRIMARY_SHADOW,
  },
  Input:       { borderRadius: RADIUS_BASE, controlHeight: 36 },
  InputNumber: { borderRadius: RADIUS_BASE, controlHeight: 36 },
  Select:      { borderRadius: RADIUS_BASE, controlHeight: 36 },
  DatePicker:  { borderRadius: RADIUS_BASE, controlHeight: 36 },
  Tabs:        { cardBg: 'transparent' },
  Segmented:   { borderRadius: RADIUS_SM },
  Tag:         { borderRadiusSM: RADIUS_SM },
});

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorBgLayout: 'transparent',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: 'rgba(15, 23, 42, 0.08)',
    colorBorderSecondary: 'rgba(15, 23, 42, 0.06)',
    borderRadius: RADIUS_BASE,
    borderRadiusLG: RADIUS_LG,
    borderRadiusSM: RADIUS_SM,
    fontSize: 14,
    boxShadow: lightShadow,
    boxShadowSecondary: lightShadowSecondary,
    boxShadowTertiary: lightShadow,
  },
  components: sharedComponents(false),
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorBgContainer: '#1a1f2e',
    colorBgLayout: 'transparent',
    colorBgElevated: '#232838',
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.62)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.42)',
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
    borderRadius: RADIUS_BASE,
    borderRadiusLG: RADIUS_LG,
    borderRadiusSM: RADIUS_SM,
    fontSize: 14,
    boxShadow: darkShadow,
    boxShadowSecondary: darkShadowSecondary,
    boxShadowTertiary: darkShadow,
  },
  components: sharedComponents(true),
};

export { RADIUS_XL, RADIUS_LG, RADIUS_BASE, RADIUS_SM };
