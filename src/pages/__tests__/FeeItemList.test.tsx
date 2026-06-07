import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockData = {
  items: [
    { id: 'fi-1', name: '物业管理费', code: 'PMF', billingRule: 'FIXED', unitPrice: 3.5, unit: '元/m²/月', cycle: 'MONTHLY', status: 'ACTIVE', projectId: null, projectName: null, createdAt: '2026-01-01' },
    { id: 'fi-2', name: '租金', code: 'RENT', billingRule: 'FIXED', unitPrice: 0, unit: '元/月', cycle: 'MONTHLY', status: 'ACTIVE', projectId: null, projectName: null, createdAt: '2026-01-01' },
    { id: 'fi-3', name: '电费', code: 'ELEC', billingRule: 'METER', unitPrice: 0.8, unit: '元/度', cycle: 'MONTHLY', status: 'ACTIVE', projectId: 'p-1', projectName: '翡翠湾', createdAt: '2026-01-01' },
    { id: 'fi-4', name: '水费', code: 'WATER', billingRule: 'METER', unitPrice: 5.0, unit: '元/吨', cycle: 'MONTHLY', status: 'DISABLED', projectId: null, projectName: null, createdAt: '2026-01-01' },
  ],
  total: 4,
};

vi.mock('@/services/billing.service', () => ({
  billingService: {
    feeItemList: vi.fn().mockResolvedValue(mockData),
    feeItemCreate: vi.fn().mockResolvedValue({ id: 'new' }),
    feeItemUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/PermissionGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe('FeeItemListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../billing/fee-items/index');
    return renderWithProviders(<mod.default />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('费项管理')).toBeInTheDocument();
    });
  });

  it('renders fee item names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('物业管理费')).toBeInTheDocument();
    });
    expect(screen.getByText('租金')).toBeInTheDocument();
    expect(screen.getByText('电费')).toBeInTheDocument();
    expect(screen.getByText('水费')).toBeInTheDocument();
  });

  it('renders fee item IDs', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('fi-1')).toBeInTheDocument();
    });
    expect(screen.getByText('fi-2')).toBeInTheDocument();
  });

  it('renders all fee items', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('物业管理费')).toBeInTheDocument();
    });
    expect(screen.getByText('水费')).toBeInTheDocument();
  });

  it('renders total count', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('共 4 条')).toBeInTheDocument();
    });
  });

  it('renders edit buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const editBtns = screen.getAllByText('编辑');
      expect(editBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders project association', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('翡翠湾')).toBeInTheDocument();
    });
  });
});
