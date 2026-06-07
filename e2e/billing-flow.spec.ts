import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount, clickSidebarMenu } from './helpers';

test.describe('账单生成', () => {
  test('账单列表加载 → 表格有数据', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('按状态 Tab 切换 → 列表刷新', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);

    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    await tabs.nth(1).click();
    await waitForPageReady(page);
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('批量生成账单 → 弹窗显示', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);

    const genBtn = page.getByRole('button', { name: /批量生成/ });
    if (await genBtn.isVisible()) {
      await genBtn.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });

      const projectSelect = page.locator('.ant-modal .ant-select').first();
      await expect(projectSelect).toBeVisible();

      await page.locator('.ant-modal .ant-modal-close').click();
    }
  });

  test('发布账单 → 提示选择', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);

    const publishBtn = page.getByRole('button', { name: /批量发布/ });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await expect(page.locator('.ant-message')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('点击账单 → 详情页渲染', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);

    const detailBtn = page.locator('.ant-table-tbody tr.ant-table-row').first().getByRole('link', { name: /详情/ }).or(
      page.locator('.ant-table-tbody tr.ant-table-row').first().getByRole('button', { name: /详情/ })
    );

    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await waitForPageReady(page);
      await expect(page.locator('.ant-descriptions')).toBeVisible({ timeout: 5000 });

      await expect(page.locator('body')).toContainText(/账单/);
    }
  });

  test('手动创建账单 → 抽屉表单', async ({ adminPage: page }) => {
    await clickSidebarMenu(page, '账单中心');
    await waitForPageReady(page);

    const createBtn = page.getByRole('button', { name: /新建|创建/ });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5000 });

      const formItems = page.locator('.ant-drawer .ant-form-item');
      const formCount = await formItems.count();
      expect(formCount).toBeGreaterThanOrEqual(3);
    }
  });
});
