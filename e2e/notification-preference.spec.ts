import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('通知偏好与批量删除', () => {
  test('点击铃铛打开通知中心', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await expect(adminPage.getByText('未读', { exact: true })).toBeVisible();
  });

  test('打开通知偏好设置抽屉', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await adminPage.getByLabel('通知设置').click();
    await expect(adminPage.getByText('通知偏好')).toBeVisible();
  });

  test('进入批量管理模式', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await adminPage.getByText('批量管理', { exact: true }).click();
    await expect(adminPage.getByText('批量管理', { exact: true })).toBeHidden();
  });

  test('偏好抽屉展示类型开关', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await waitForPageReady(adminPage);
    await adminPage.getByLabel('通知中心').click();
    await adminPage.getByLabel('通知设置').click();
    await expect(adminPage.getByRole('dialog').getByText('合同到期')).toBeVisible();
  });
});
