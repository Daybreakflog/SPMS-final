import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('性能监控', () => {
  test('性能监控页可访问', async ({ adminPage }) => {
    await adminPage.goto('/system/performance');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '性能监控' })).toBeVisible();
  });

  test('展示 KPI 统计卡', async ({ adminPage }) => {
    await adminPage.goto('/system/performance');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('CPU 使用率').first()).toBeVisible();
    await expect(adminPage.getByText('在线用户').first()).toBeVisible();
  });

  test('展示资源趋势图表容器', async ({ adminPage }) => {
    await adminPage.goto('/system/performance');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('资源趋势（CPU / 内存）')).toBeVisible();
  });

  test('可切换时间范围', async ({ adminPage }) => {
    await adminPage.goto('/system/performance');
    await waitForPageReady(adminPage);
    await adminPage.getByText('近 7 天', { exact: true }).click();
    await expect(adminPage.getByText('近 7 天', { exact: true })).toBeVisible();
  });
});
