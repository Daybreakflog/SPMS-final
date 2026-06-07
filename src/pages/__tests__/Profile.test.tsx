import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockUser = {
  id: 'u-1',
  username: 'zhangsan',
  realName: '张三',
  companyName: '示例物业',
  roles: ['PLATFORM_ADMIN'],
  projectIds: ['p-1', 'p-2'],
};

vi.mock('@/store/user.store', () => ({
  useUserStore: (selector: (s: { user: typeof mockUser }) => unknown) => selector({ user: mockUser }),
}));

vi.mock('@/services/user.service', () => ({
  userService: {
    changePassword: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../profile/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('个人中心')).toBeInTheDocument();
    });
  });

  it('renders real name', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  it('renders username', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('@zhangsan')).toBeInTheDocument();
    });
  });

  it('renders company name', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('示例物业')).toBeInTheDocument();
    });
  });

  it('renders authorized project count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('2 个')).toBeInTheDocument();
    });
  });

  it('renders change password card', async () => {
    await renderPage();
    await waitFor(() => {
      // “修改密码”同时作为卡片标题与提交按钮文本，故用 getAllByText
      expect(screen.getAllByText('修改密码').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders password form fields', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入原密码')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('请输入新密码')).toBeInTheDocument();
  });
});
