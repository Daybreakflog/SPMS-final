import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('全局搜索', () => {
  test('Ctrl+K 打开搜索面板', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 3000 });
  });

  test('输入关键词 → 显示搜索结果', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 3000 });
    await page.locator('.ant-modal input').fill('仪表盘');
    await page.waitForTimeout(500);
    const results = page.locator('.ant-modal .ant-list-item');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
  });

  test('Escape 关闭搜索面板', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 3000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('.ant-modal')).toBeHidden({ timeout: 3000 });
  });
});
