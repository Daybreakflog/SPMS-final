import { http, HttpResponse } from 'msw';
import type { SystemSetting } from '@/types/api/setting';

// ⚠ MSW DRIFT MARKER
//   /api/system/settings 系列接口（GET / PATCH basic|notification|security）
//   后端 Swagger 1.0 完全没有定义。
//   仅用于开发期 UI 联调，settingService 通过 VITE_SYSTEM_SETTINGS_ENABLED 控制是否真正调用。

const state: SystemSetting = {
  basic: { systemName: '智慧物业管理系统', logoUrl: undefined },
  notification: { emailNotify: true, smsNotify: false, pushNotify: true },
  security: {
    passwordMinLength: 8,
    passwordExpireDays: 90,
    maxLoginAttempts: 5,
    lockDuration: 30,
    sessionTimeout: 30,
  },
};

export const settingHandlers = [
  http.get('/api/system/settings', () => {
    return HttpResponse.json(state);
  }),

  http.patch('/api/system/settings/basic', async ({ request }) => {
    const body = (await request.json()) as Partial<SystemSetting['basic']>;
    state.basic = { ...state.basic, ...body };
    return HttpResponse.json(state);
  }),

  http.patch('/api/system/settings/notification', async ({ request }) => {
    const body = (await request.json()) as Partial<SystemSetting['notification']>;
    state.notification = { ...state.notification, ...body };
    return HttpResponse.json(state);
  }),

  http.patch('/api/system/settings/security', async ({ request }) => {
    const body = (await request.json()) as Partial<SystemSetting['security']>;
    state.security = { ...state.security, ...body };
    return HttpResponse.json(state);
  }),
];
