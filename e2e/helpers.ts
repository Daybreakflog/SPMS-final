import type { Page } from '@playwright/test';

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function getTableRowCount(page: Page): Promise<number> {
  return page.locator('.ant-table-tbody tr.ant-table-row').count();
}

export async function clickSidebarMenu(page: Page, menuText: string) {
  await page.locator('.ant-menu').getByText(menuText, { exact: true }).click();
}
