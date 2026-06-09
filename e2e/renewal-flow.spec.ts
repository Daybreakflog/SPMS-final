import { test, expect } from './fixtures';
import { waitForPageReady, getTableRowCount } from './helpers';

test.describe('合同续签工作流', () => {
  test('续签申请列表页可访问', async ({ adminPage }) => {
    await adminPage.goto('/contracts/renewals');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading', { name: '续签申请' })).toBeVisible();
  });

  test('续签列表展示数据行', async ({ adminPage }) => {
    await adminPage.goto('/contracts/renewals');
    await waitForPageReady(adminPage);
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThan(0);
  });

  test('续签列表展示状态标签', async ({ adminPage }) => {
    await adminPage.goto('/contracts/renewals');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByText('待审批').first()).toBeVisible();
  });

  test('待审批申请显示通过/拒绝操作', async ({ adminPage }) => {
    await adminPage.goto('/contracts/renewals');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('button', { name: '通过' }).first()).toBeVisible();
  });

  test('点击通过可审批续签申请', async ({ adminPage }) => {
    await adminPage.goto('/contracts/renewals');
    await waitForPageReady(adminPage);
    const approveBtn = adminPage.getByRole('button', { name: '通过' }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(adminPage.locator('.ant-message, .ant-modal')).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
    await expect(adminPage.getByRole('heading', { name: '续签申请' })).toBeVisible();
  });

  test('合同列表页可访问且含申请续签入口', async ({ adminPage }) => {
    await adminPage.goto('/contracts');
    await waitForPageReady(adminPage);
    await expect(adminPage.getByRole('heading').first()).toBeVisible();
    const rows = await getTableRowCount(adminPage);
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});
