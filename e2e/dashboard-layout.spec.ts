import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('仪表盘自定义布局', () => {
  test('设置面板打开/关闭', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    const settingBtn = page.locator('button').filter({ has: page.locator('[data-icon="setting"]') });
    await settingBtn.last().click();
    await expect(page.locator('.ant-segmented')).toBeVisible({ timeout: 3000 });
    await settingBtn.last().click();
  });

  test('切换密度 → 紧凑/标准', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    const settingBtn = page.locator('button').filter({ has: page.locator('[data-icon="setting"]') });
    await settingBtn.last().click();
    const segmented = page.locator('.ant-segmented');
    await expect(segmented).toBeVisible({ timeout: 3000 });
    const compactOption = segmented.locator('.ant-segmented-item').first();
    await compactOption.click();
  });

  test('模块显隐切换', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    const settingBtn = page.locator('button').filter({ has: page.locator('[data-icon="setting"]') });
    await settingBtn.last().click();
    const switches = page.locator('.ant-switch');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await switches.first().click();
  });

  test('全屏按钮可点击', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    const fullscreenBtn = page.locator('button').filter({ has: page.locator('[data-icon="fullscreen"]') });
    await expect(fullscreenBtn).toBeVisible();
  });

  test('KPI 卡片渲染', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    const cards = page.locator('.ant-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2);
  });

  test('收缴趋势图表渲染', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    await expect(page.getByText('收缴趋势')).toBeVisible();
  });

  test('待办列表渲染', async ({ adminPage: page }) => {
    await waitForPageReady(page);
    await expect(page.getByText('待办事项')).toBeVisible();
  });
});
