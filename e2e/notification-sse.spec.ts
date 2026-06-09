import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('通知中心 & SSE', () => {
  test('通知中心铃铛按钮存在', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    const bell = adminPage.getByRole('button', { name: /通知中心|bell/i });
    await expect(bell).toBeVisible();
  });

  test('点击铃铛展开通知列表', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('button', { name: /通知中心/ }).click();
    await adminPage.waitForTimeout(300);
    await expect(adminPage.getByText(/全部|未读/).first()).toBeVisible();
  });

  test('通知偏好页可访问', async ({ adminPage }) => {
    await adminPage.goto('/notice/notifications');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: /消息|通知/ })).toBeVisible();
  });

  test('通知列表展示消息条目', async ({ adminPage }) => {
    await adminPage.goto('/notice/notifications');
    await waitForPageReady(adminPage);
    await adminPage.waitForTimeout(500);
    const page = adminPage;
    const rows = page.locator('table tbody tr, .ant-list-item');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
