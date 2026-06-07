import { test, expect } from './fixtures';
import { waitForPageReady } from './helpers';

test.describe('登录流程', () => {
  test('正确用户名密码 → 跳转 /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('**/dashboard');
    await waitForPageReady(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('错误密码 → 显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('wrongpassword');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.locator('.ant-message')).toBeVisible({ timeout: 5000 });
  });

  test('未登录访问 /dashboard → 重定向 /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('登录后刷新 → 保持登录状态', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('admin123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('**/dashboard');
    await page.reload();
    await waitForPageReady(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
