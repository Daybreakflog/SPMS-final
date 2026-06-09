import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('房间状态看板', () => {
  test('房间管理页可访问', async ({ adminPage }) => {
    await adminPage.goto('/properties/units');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '房间管理' })).toBeVisible();
  });

  test('默认展示看板视图', async ({ adminPage }) => {
    await adminPage.goto('/properties/units');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByTestId('kanban-view')).toBeVisible();
  });

  test('可切换到列表视图', async ({ adminPage }) => {
    await adminPage.goto('/properties/units');
    await waitForPageReady(adminPage);
    await adminPage.getByText('列表视图', { exact: true }).click();
    await expect(adminPage.locator('.ant-table')).toBeVisible();
  });

  test('点击看板卡片打开详情抽屉', async ({ adminPage }) => {
    await adminPage.goto('/properties/units');
    await waitForPageReady(adminPage);
    const card = adminPage.locator('[data-testid="kanban-view"] [role="button"]').first();
    if (await card.isVisible()) {
      await card.click();
      await expect(adminPage.getByRole('dialog')).toBeVisible();
    }
  });
});
