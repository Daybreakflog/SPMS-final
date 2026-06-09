import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { settingService } from '../setting.service';
import { http } from '@/api/request';

const mockHttp = http as unknown as { get: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

const mockSetting = {
  basic: { systemName: '测试系统', logoUrl: undefined },
  notification: { emailNotify: true, smsNotify: false, pushNotify: true },
  security: { passwordMinLength: 8, passwordExpireDays: 90, maxLoginAttempts: 5, lockDuration: 30, sessionTimeout: 30 },
};

describe('settingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHttp.get.mockResolvedValue(mockSetting);
    mockHttp.patch.mockResolvedValue(mockSetting);
  });

  it('get calls /system/settings', async () => {
    await settingService.get();
    expect(mockHttp.get).toHaveBeenCalledWith('/system/settings');
  });

  it('updateBasic calls /system/settings/basic with PATCH', async () => {
    const payload = { systemName: '新系统名' };
    await settingService.updateBasic(payload);
    expect(mockHttp.patch).toHaveBeenCalledWith('/system/settings/basic', payload);
  });

  it('updateNotification calls /system/settings/notification with PATCH', async () => {
    const payload = { emailNotify: false, smsNotify: true, pushNotify: false };
    await settingService.updateNotification(payload);
    expect(mockHttp.patch).toHaveBeenCalledWith('/system/settings/notification', payload);
  });

  it('updateSecurity calls /system/settings/security with PATCH', async () => {
    const payload = { passwordMinLength: 10, passwordExpireDays: 60, maxLoginAttempts: 3, lockDuration: 15, sessionTimeout: 60 };
    await settingService.updateSecurity(payload);
    expect(mockHttp.patch).toHaveBeenCalledWith('/system/settings/security', payload);
  });

  it('get returns system setting shape', async () => {
    const result = await settingService.get();
    expect(result).toHaveProperty('basic');
    expect(result).toHaveProperty('notification');
    expect(result).toHaveProperty('security');
  });
});
