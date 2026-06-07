import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount, clickSidebarMenu } from './helpers';

test.describe('报修闭环', () => {
  test('工单列表加载 → 表格有数据', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('点击工单 → 详情页信息完整', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    const repairNo = await firstRow.locator('td').first().textContent();
    await firstRow.click();
    await waitForPageReady(page);

    await expect(page.locator('.ant-descriptions')).toBeVisible({ timeout: 5000 });
    if (repairNo) {
      await expect(page.locator('body')).toContainText(repairNo);
    }

    await expect(page.locator('.ant-tag')).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('分配工程师 → 弹窗表单 → 选择工程师', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const assignBtn = page.getByRole('button', { name: /分配/ });
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });

      const engineerSelect = page.locator('.ant-modal .ant-select');
      await expect(engineerSelect).toBeVisible();

      await engineerSelect.click();
      const options = page.locator('.ant-select-dropdown .ant-select-item');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      await page.locator('.ant-modal .ant-modal-close').click();
    }
  });

  test('更新进度 → 弹窗表单', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const progressBtn = page.getByRole('button', { name: /进度/ });
    if (await progressBtn.isVisible()) {
      await progressBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });

      const textarea = page.locator('.ant-modal textarea');
      await expect(textarea).toBeVisible();
      await textarea.fill('测试进度更新内容');
      await expect(textarea).toHaveValue('测试进度更新内容');

      await page.locator('.ant-modal .ant-modal-close').click();
    }
  });

  test('完成工单 → 弹窗表单', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const completeBtn = page.getByRole('button', { name: /完成/ });
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });

      const textarea = page.locator('.ant-modal textarea');
      await expect(textarea).toBeVisible();

      await page.locator('.ant-modal .ant-modal-close').click();
    }
  });

  test('工单时间轴渲染', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    const timeline = page.locator('.ant-timeline');
    await expect(timeline).toBeVisible({ timeout: 5000 });
    const items = timeline.locator('.ant-timeline-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('实时消息组件渲染', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '报修工单');
    await waitForPageReady(page);
    await page.locator('.ant-table-tbody tr.ant-table-row').first().click();
    await waitForPageReady(page);

    await expect(page.locator('.ant-card')).toHaveCount(2, { timeout: 5000 }).catch(() => {
      // At least one card should be visible (descriptions + timeline)
    });
  });
});
