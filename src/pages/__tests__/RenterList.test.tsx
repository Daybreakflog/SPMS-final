import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'rt-1', name: '张三', gender: 'MALE', phone: '13800138001', idType: 'ID_CARD', idNumber: '310101199001011234', currentUnit: 'A-101', currentProjectName: '翡翠湾', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-05-01T10:00:00Z' },
    { id: 'rt-2', name: '李四', gender: 'FEMALE', phone: '13900139001', idType: 'ID_CARD', idNumber: '310101199202022345', currentUnit: 'B-202', currentProjectName: '阳光城', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-05-02T10:00:00Z' },
    { id: 'rt-3', name: '王五', gender: 'MALE', phone: '13700137001', idType: 'PASSPORT', idNumber: 'E12345678', currentUnit: null, currentProjectName: null, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-05-03T10:00:00Z' },
  ],
  total: 3,
};

vi.mock('@/services/renter.service', () => ({
  renterService: {
    list: vi.fn().mockResolvedValue(mockData),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RenterListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../customers/renters/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('租户档案')).toBeInTheDocument();
    });
  });

  it('renders renter names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('王五')).toBeInTheDocument();
  });

  it('renders masked phone numbers', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('138****8001')).toBeInTheDocument();
    });
  });

  it('renders unit numbers', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });
    expect(screen.getByText('B-202')).toBeInTheDocument();
  });

  it('renders search filter', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('姓名/手机/证件号')).toBeInTheDocument();
    });
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 3 条')).toBeInTheDocument();
    });
  });

  it('renders detail buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const detailBtns = screen.getAllByText('详情');
      expect(detailBtns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
