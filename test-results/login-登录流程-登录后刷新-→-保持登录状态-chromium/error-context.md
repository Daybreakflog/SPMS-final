# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> 登录流程 >> 登录后刷新 → 保持登录状态
- Location: e2e\login.spec.ts:28:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '登录' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "智慧物业管理系统" [level=1] [ref=e8]
      - paragraph [ref=e9]: 管理端登录
    - form "智慧物业管理系统" [ref=e10]:
      - generic [ref=e16]:
        - img "user" [ref=e18]:
          - img [ref=e19]
        - textbox "请输入用户名" [ref=e21]: admin
      - generic [ref=e27]:
        - img "lock" [ref=e29]:
          - img [ref=e30]
        - textbox "请输入密码" [active] [ref=e32]: admin123
        - button "显示" [ref=e34] [cursor=pointer]:
          - img "eye-invisible" [ref=e35]:
            - img [ref=e36]
      - button "登 录" [ref=e44] [cursor=pointer]:
        - generic [ref=e45]: 登 录
    - generic [ref=e46]: "开发环境账号: admin / admin123"
  - generic [ref=e47]:
    - img [ref=e49]
    - button "Open Tanstack query devtools" [ref=e97] [cursor=pointer]:
      - img [ref=e98]
```

# Test source

```ts
  1  | import { test, expect } from './fixtures';
  2  | import { waitForPageReady } from './helpers';
  3  | 
  4  | test.describe('登录流程', () => {
  5  |   test('正确用户名密码 → 跳转 /dashboard', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     await page.getByPlaceholder('请输入用户名').fill('admin');
  8  |     await page.getByPlaceholder('请输入密码').fill('admin123');
  9  |     await page.getByRole('button', { name: '登录' }).click();
  10 |     await page.waitForURL('**/dashboard');
  11 |     await waitForPageReady(page);
  12 |     await expect(page).toHaveURL(/\/dashboard/);
  13 |   });
  14 | 
  15 |   test('错误密码 → 显示错误提示', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     await page.getByPlaceholder('请输入用户名').fill('admin');
  18 |     await page.getByPlaceholder('请输入密码').fill('wrongpassword');
  19 |     await page.getByRole('button', { name: '登录' }).click();
  20 |     await expect(page.locator('.ant-message')).toBeVisible({ timeout: 5000 });
  21 |   });
  22 | 
  23 |   test('未登录访问 /dashboard → 重定向 /login', async ({ page }) => {
  24 |     await page.goto('/dashboard');
  25 |     await expect(page).toHaveURL(/\/login/);
  26 |   });
  27 | 
  28 |   test('登录后刷新 → 保持登录状态', async ({ page }) => {
  29 |     await page.goto('/login');
  30 |     await page.getByPlaceholder('请输入用户名').fill('admin');
  31 |     await page.getByPlaceholder('请输入密码').fill('admin123');
> 32 |     await page.getByRole('button', { name: '登录' }).click();
     |                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  33 |     await page.waitForURL('**/dashboard');
  34 |     await page.reload();
  35 |     await waitForPageReady(page);
  36 |     await expect(page).toHaveURL(/\/dashboard/);
  37 |   });
  38 | });
  39 | 
```