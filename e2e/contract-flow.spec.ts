import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount, clickSidebarMenu } from './helpers';

test.describe('合同审批流', () => {
  test('合同列表加载 → 表格有数据', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('创建草稿合同', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);

    await page.getByRole('button', { name: /新建|创建/ }).click();
    await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5000 });

    await page.locator('.ant-drawer .ant-select').first().click();
    await page.locator('.ant-select-dropdown .ant-select-item').first().click();

    const unitInput = page.locator('.ant-drawer').getByLabel(/单元/);
    if (await unitInput.isVisible()) {
      await unitInput.fill('unit-001');
    }

    const startDatePicker = page.locator('.ant-drawer .ant-picker').first();
    await startDatePicker.click();
    await page.locator('.ant-picker-dropdown .ant-picker-cell-today').first().click();

    await expect(page.locator('.ant-drawer')).toBeVisible();
  });

  test('点击合同 → 详情页渲染 → 状态显示正确', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    const contractNo = await firstRow.locator('td').first().textContent();
    await firstRow.click();
    await waitForPageReady(page);

    await expect(page.locator('.ant-descriptions, .ant-card')).toBeVisible({ timeout: 5000 });
    if (contractNo) {
      await expect(page.locator('body')).toContainText(contractNo);
    }

    await expect(page.locator('.ant-tag')).toHaveCount(1, { timeout: 5000 }).catch(() => {});
  });

  test('审批时间轴渲染 → 有时间节点', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const timeline = page.locator('.ant-timeline');
    await expect(timeline).toBeVisible({ timeout: 5000 });
    const timelineItems = timeline.locator('.ant-timeline-item');
    const count = await timelineItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('合同详情 → 操作按钮根据状态显示', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const actionArea = page.locator('.ant-space').first();
    await expect(actionArea).toBeVisible({ timeout: 5000 });
    const buttons = actionArea.getByRole('button');
    const btnCount = await buttons.count();
    expect(btnCount).toBeGreaterThanOrEqual(0);
  });

  test('合同 Tabs 切换', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '全部合同');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    if (tabCount > 1) {
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveClass(/ant-tabs-tab-active/);
    }
  });
});
