import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount } from './helpers';

test.describe('账单自动生成规则', () => {
  test('账单规则页可访问', async ({ adminPage }) => {
    await adminPage.goto('/system/billing-rules');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '账单生成规则' })).toBeVisible();
  });

  test('规则列表展示数据行', async ({ adminPage }) => {
    await adminPage.goto('/system/billing-rules');
    await waitForPageReady(adminPage);
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThan(0);
  });

  test('点击新建规则打开抽屉', async ({ adminPage }) => {
    await adminPage.goto('/system/billing-rules');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('button', { name: '新建规则' }).click();
    await expect(adminPage.getByRole('dialog')).toBeVisible();
  });

  test('规则行包含自动生成开关', async ({ adminPage }) => {
    await adminPage.goto('/system/billing-rules');
    await waitForPageReady(adminPage);
    await expect(adminPage.locator('.ant-switch').first()).toBeVisible();
  });
});
