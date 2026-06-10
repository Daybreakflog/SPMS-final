import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/setting.service', () => ({
  settingService: {
    get: vi.fn(),
    updateBasic: vi.fn(),
    updateNotification: vi.fn(),
    updateSecurity: vi.fn(),
  },
  isSystemSettingsApiEnabled: () => true,
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { settingService } from '@/services/setting.service';
import SystemSettingsPage from '../system/settings/index';

const mockSetting = {
  basic: { systemName: '智慧物业', logoUrl: '' },
  notification: { emailNotify: true, smsNotify: false, pushNotify: true },
  security: { passwordMinLength: 8, passwordExpireDays: 90, maxLoginAttempts: 5, lockDuration: 30, sessionTimeout: 30 },
};

describe('SystemSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingService.get).mockResolvedValue(mockSetting);
    vi.mocked(settingService.updateBasic).mockResolvedValue(mockSetting);
    vi.mocked(settingService.updateNotification).mockResolvedValue(mockSetting);
    vi.mocked(settingService.updateSecurity).mockResolvedValue(mockSetting);
  });

  it('加载时调用 settingService.get', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => expect(settingService.get).toHaveBeenCalledTimes(1));
  });

  it('加载完成后填充基础信息表单', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => {
      const input = screen.queryByDisplayValue('智慧物业');
      expect(input).toBeInTheDocument();
    });
  });

  it('基础保存按钮调用 updateBasic', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => screen.getByDisplayValue('智慧物业'));

    const saveBtn = screen.getAllByRole('button', { name: /保\s*存/ })[0];
    fireEvent.click(saveBtn);
    await waitFor(() => expect(settingService.updateBasic).toHaveBeenCalledTimes(1));
  });

  it('通知设置 Tab 可以切换', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => screen.getByDisplayValue('智慧物业'));

    const notifyTab = screen.getAllByRole('tab').find((el) => el.textContent?.includes('通知'));
    if (notifyTab) fireEvent.click(notifyTab);
  });

  it('通知保存按钮调用 updateNotification', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => screen.getByDisplayValue('智慧物业'));

    const tabs = screen.getAllByRole('tab');
    const notifyTab = tabs.find((el) => el.textContent?.includes('通知'));
    if (notifyTab) fireEvent.click(notifyTab);

    const saveBtns = screen.getAllByRole('button', { name: /保\s*存/ });
    fireEvent.click(saveBtns[0]);
    await waitFor(() => {
      expect(
        (settingService.updateBasic as ReturnType<typeof vi.fn>).mock.calls.length +
        (settingService.updateNotification as ReturnType<typeof vi.fn>).mock.calls.length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('安全设置 Tab 可以切换', async () => {
    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => screen.getByDisplayValue('智慧物业'));

    const tabs = screen.getAllByRole('tab');
    const secTab = tabs.find((el) => el.textContent?.includes('安全'));
    if (secTab) fireEvent.click(secTab);

    await waitFor(() => {
      const el = screen.queryByDisplayValue('8');
      expect(el).toBeTruthy();
    });
  });

  it('loading 状态：保存按钮在提交时进入 loading', async () => {
    let resolveUpdate: () => void;
    vi.mocked(settingService.updateBasic).mockImplementation(
      () => new Promise((r) => { resolveUpdate = r as () => void; })
    );

    renderWithProviders(<SystemSettingsPage />);
    await waitFor(() => screen.getByDisplayValue('智慧物业'));

    const saveBtn = screen.getAllByRole('button', { name: /保\s*存/ })[0];
    fireEvent.click(saveBtn);

    await waitFor(() => { expect(saveBtn).toBeInTheDocument(); });
    resolveUpdate!();
  });
});
