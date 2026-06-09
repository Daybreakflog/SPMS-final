import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('系统设置页', () => {
  test('系统设置页可访问', async ({ adminPage }) => {
    await adminPage.goto('/system/settings');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: /系统设置/ })).toBeVisible();
  });

  test('基础信息 Tab 展示系统名称输入框', async ({ adminPage }) => {
    await adminPage.goto('/system/settings');
    await waitForPageReady(adminPage);
    const input = adminPage.getByRole('textbox').first();
    await expect(input).toBeVisible();
  });

  test('保存按钮存在', async ({ adminPage }) => {
    await adminPage.goto('/system/settings');
    await waitForPageReady(adminPage);
    const saveBtn = adminPage.getByRole('button', { name: /保\s*存/ }).first();
    await expect(saveBtn).toBeVisible();
  });

  test('通知设置 Tab 可切换', async ({ adminPage }) => {
    await adminPage.goto('/system/settings');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('tab', { name: /通知/ }).click();
    await expect(adminPage.getByText(/邮件通知|email/i).first()).toBeVisible();
  });

  test('安全设置 Tab 可切换', async ({ adminPage }) => {
    await adminPage.goto('/system/settings');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('tab', { name: /安全/ }).click();
    await expect(adminPage.getByText(/密码|password/i).first()).toBeVisible();
  });
});
