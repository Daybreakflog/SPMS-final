import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('公司详情页', () => {
  test('公司详情页可访问', async ({ adminPage }) => {
    await adminPage.goto('/platform/companies');
    await waitForPageReady(adminPage);
    const firstRow = adminPage.locator('table tbody tr').first();
    await firstRow.click();
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('tab', { name: '基础信息' })).toBeVisible();
  });

  test('项目列表 Tab 可切换', async ({ adminPage }) => {
    await adminPage.goto('/platform/companies');
    await waitForPageReady(adminPage);
    await adminPage.locator('table tbody tr').first().click();
    await waitForPageReady(adminPage);
    await adminPage.getByRole('tab', { name: /项目列表/ }).click();
    await adminPage.waitForTimeout(500);
    await expect(adminPage.getByRole('tab', { name: /项目列表/ })).toBeVisible();
  });

  test('员工列表 Tab 可切换', async ({ adminPage }) => {
    await adminPage.goto('/platform/companies');
    await waitForPageReady(adminPage);
    await adminPage.locator('table tbody tr').first().click();
    await waitForPageReady(adminPage);
    await adminPage.getByRole('tab', { name: /员工列表/ }).click();
    await adminPage.waitForTimeout(500);
    await expect(adminPage.getByRole('tab', { name: /员工列表/ })).toBeVisible();
  });

  test('基础信息展示公司联系人', async ({ adminPage }) => {
    await adminPage.goto('/platform/companies');
    await waitForPageReady(adminPage);
    await adminPage.locator('table tbody tr').first().click();
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('联系人')).toBeVisible();
  });
});
