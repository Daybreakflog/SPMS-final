import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/store/user.store', () => ({
  useUserStore: Object.assign(
    vi.fn((sel: (s: Record<string, unknown>) => unknown) =>
      sel({ user: { roles: ['PLATFORM_ADMIN'] } }),
    ),
    { getState: () => ({ user: { roles: ['PLATFORM_ADMIN'] } }) },
  ),
}));

describe('PermissionsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  async function renderPage() {
    const mod = await import('../system/permissions/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('权限管理')).toBeInTheDocument();
    });
  });

  it('renders module permission switches', async () => {
    await renderPage();
    await waitFor(() => {
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  it('renders role descriptions', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('拥有系统最高权限，可管理所有功能')).toBeInTheDocument();
    });
  });

  it('has module/action segmented control', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('操作权限')).toBeInTheDocument();
    });
  });

  it('switches to action mode', async () => {
    await renderPage();
    await waitFor(() => {
      const actionBtn = screen.getByText('操作权限');
      fireEvent.click(actionBtn);
    });
    await waitFor(() => {
      expect(screen.getAllByText('新建').length).toBeGreaterThan(0);
    });
  });

  it('renders at least 10 module rows in table', async () => {
    await renderPage();
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThanOrEqual(10);
    });
  });

  it('renders role matrix subtitle', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('角色权限矩阵')).toBeInTheDocument();
    });
  });

  it('renders role tags', async () => {
    await renderPage();
    await waitFor(() => {
      const tags = screen.getAllByText(/管理员/);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  it('renders table with bordered style', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.querySelector('.ant-table-bordered')).toBeTruthy();
    });
  });

  it('renders action mode label', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('操作权限')).toBeInTheDocument();
    });
  });
});
