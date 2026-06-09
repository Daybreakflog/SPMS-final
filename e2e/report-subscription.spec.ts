import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount } from './helpers';

test.describe('报表订阅', () => {
  test('报表订阅页可访问', async ({ adminPage }) => {
    await adminPage.goto('/reports/subscriptions');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '报表订阅' })).toBeVisible();
  });

  test('订阅列表展示数据行', async ({ adminPage }) => {
    await adminPage.goto('/reports/subscriptions');
    await waitForPageReady(adminPage);
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThan(0);
  });

  test('点击新建订阅打开抽屉', async ({ adminPage }) => {
    await adminPage.goto('/reports/subscriptions');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('button', { name: '新建订阅' }).click();
    await expect(adminPage.getByRole('dialog')).toBeVisible();
  });

  test('行内提供立即推送操作', async ({ adminPage }) => {
    await adminPage.goto('/reports/subscriptions');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('button', { name: '立即推送' }).first()).toBeVisible();
  });
});
