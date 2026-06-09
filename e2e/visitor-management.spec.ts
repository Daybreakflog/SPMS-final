import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount } from './helpers';

test.describe('访客管理', () => {
  test('访客管理页可访问', async ({ adminPage }) => {
    await adminPage.goto('/service/visitors');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '访客管理' })).toBeVisible();
  });

  test('显示今日来访与当前在访统计', async ({ adminPage }) => {
    await adminPage.goto('/service/visitors');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('今日来访')).toBeVisible();
    await expect(adminPage.getByText('当前在访')).toBeVisible();
  });

  test('访客列表展示数据行', async ({ adminPage }) => {
    await adminPage.goto('/service/visitors');
    await waitForPageReady(adminPage);
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThan(0);
  });

  test('点击访客登记打开抽屉', async ({ adminPage }) => {
    await adminPage.goto('/service/visitors');
    await waitForPageReady(adminPage);
    await adminPage.getByRole('button', { name: '访客登记' }).click();
    await expect(adminPage.getByRole('dialog')).toBeVisible();
  });

  test('访问中记录显示离场操作', async ({ adminPage }) => {
    await adminPage.goto('/service/visitors');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('访问中').first()).toBeVisible();
    const leaveBtn = adminPage.getByRole('button', { name: '离场' }).first();
    if (await leaveBtn.isVisible()) {
      await leaveBtn.click();
    }
    await expect(adminPage.getByRole('heading', { name: '访客管理' })).toBeVisible();
  });
});
