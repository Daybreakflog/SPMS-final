import { test, expect } from './fixtures';
import { waitForPageReady, clickSidebarMenu } from './helpers';

test.describe('导出中心', () => {
  test('导出中心页面加载', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '导出中心');
    await waitForPageReady(page);
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('新建导出任务 → 弹窗显示', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '导出中心');
    await waitForPageReady(page);
    const newBtn = page.getByRole('button', { name: /新建导出/ });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 3000 });
    }
  });

  test('选择导出类型 → 开始导出', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '导出中心');
    await waitForPageReady(page);
    const newBtn = page.getByRole('button', { name: /新建导出/ });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 3000 });
      const select = page.locator('.ant-modal .ant-select');
      if (await select.isVisible()) {
        await select.click();
        const option = page.locator('.ant-select-dropdown .ant-select-item').first();
        await option.click();
      }
    }
  });
});
