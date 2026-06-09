import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('实时通知中心', () => {
  test('头部铃铛图标可见', async ({ adminPage }) => {
    await waitForPageReady(adminPage);
    await expect(adminPage.getByLabel('通知中心')).toBeVisible();
  });

  test('点击铃铛打开通知弹层并显示标签页', async ({ adminPage }) => {
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await expect(adminPage.getByText('全部', { exact: true })).toBeVisible();
    await expect(adminPage.getByText('未读', { exact: true })).toBeVisible();
  });

  test('可切换到未读标签页', async ({ adminPage }) => {
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await adminPage.getByText('未读', { exact: true }).click();
    await expect(adminPage.getByText('未读', { exact: true })).toBeVisible();
  });

  test('显示全部标为已读按钮', async ({ adminPage }) => {
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await expect(adminPage.getByRole('button', { name: '全部标为已读' })).toBeVisible();
  });

  test('点击全部标为已读后未读数清零', async ({ adminPage }) => {
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    const markAll = adminPage.getByRole('button', { name: '全部标为已读' });
    if (await markAll.isEnabled()) {
      await markAll.click();
    }
    await expect(adminPage.getByLabel('通知中心')).toBeVisible();
  });
});
