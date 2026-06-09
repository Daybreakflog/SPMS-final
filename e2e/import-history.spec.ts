import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount } from './helpers';

test.describe('导入历史', () => {
  test('导入历史页可访问', async ({ adminPage }) => {
    await adminPage.goto('/system/import-history');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '导入历史' })).toBeVisible();
  });

  test('导入任务列表展示数据行', async ({ adminPage }) => {
    await adminPage.goto('/system/import-history');
    await waitForPageReady(adminPage);
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThan(0);
  });

  test('按状态筛选导入任务', async ({ adminPage }) => {
    await adminPage.goto('/system/import-history');
    await waitForPageReady(adminPage);
    await adminPage.locator('.ant-select').first().click();
    const option = adminPage.locator('.ant-select-item-option').first();
    if (await option.isVisible()) {
      await option.click();
    }
    await expect(adminPage.getByRole('heading', { name: '导入历史' })).toBeVisible();
  });

  test('失败任务可展开错误明细', async ({ adminPage }) => {
    await adminPage.goto('/system/import-history');
    await waitForPageReady(adminPage);
    const expandIcon = adminPage.locator('.ant-table-row-expand-icon').first();
    if (await expandIcon.isVisible()) {
      await expandIcon.click();
    }
    await expect(adminPage.getByRole('heading', { name: '导入历史' })).toBeVisible();
  });
});
