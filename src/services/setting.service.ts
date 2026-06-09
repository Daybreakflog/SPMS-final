// ⚠ /api/system/settings 系列接口后端尚未实现（Swagger 1.0 无对应路径）。
//   开发期可通过 MSW 提供模拟响应；生产环境直接请求会得到 404，
//   这里不再返回静默成功的假数据，必须让上层感知到接口缺失。
import { http } from '@/api/request';
import type { SystemSetting, BasicSettingDTO, NotificationSettingDTO, SecuritySettingDTO } from '@/types/api/setting';

const SETTINGS_API_ENABLED = import.meta.env.VITE_SYSTEM_SETTINGS_ENABLED === 'true';

function ensureEnabled(): void {
  if (!SETTINGS_API_ENABLED && !import.meta.env.DEV) {
    // 生产 / 预发布：后端未实现时禁止任何"假成功"
    throw new Error('System settings API not implemented');
  }
}

export const settingService = {
  get: (): Promise<SystemSetting> => {
    ensureEnabled();
    return http.get<SystemSetting>('/system/settings');
  },

  updateBasic: (data: BasicSettingDTO): Promise<SystemSetting> => {
    ensureEnabled();
    return http.patch<SystemSetting>('/system/settings/basic', data);
  },

  updateNotification: (data: NotificationSettingDTO): Promise<SystemSetting> => {
    ensureEnabled();
    return http.patch<SystemSetting>('/system/settings/notification', data);
  },

  updateSecurity: (data: SecuritySettingDTO): Promise<SystemSetting> => {
    ensureEnabled();
    return http.patch<SystemSetting>('/system/settings/security', data);
  },
};

export const isSystemSettingsApiEnabled = (): boolean =>
  SETTINGS_API_ENABLED || import.meta.env.DEV;
