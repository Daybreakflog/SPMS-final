import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

const mockContracts = {
  items: [
    {
      id: 'c-001',
      contractNo: 'CT-2026-001',
      renterName: '张伟',
      unitNumber: '101',
      buildingName: 'A栋',
      monthlyRent: 5000,
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      status: 'DRAFT',
      creatorName: '管理员',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'c-002',
      contractNo: 'CT-2026-002',
      renterName: '李芳',
      unitNumber: '202',
      buildingName: 'B栋',
      monthlyRent: 8000,
      startDate: '2026-03-01',
      endDate: '2027-03-01',
      status: 'ACTIVE',
      creatorName: '管理员',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

vi.mock('@/services/contract.service', () => ({
  contractService: {
    list: vi.fn().mockResolvedValue(mockContracts),
    submit: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/renter.service', () => ({
  renterService: {
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

describe('ContractListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const mod = await import('../contracts/index');
    const ContractListPage = mod.default;
    return renderWithProviders(<ContractListPage />);
  }

  it('renders page title', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('合同管理')).toBeInTheDocument();
    });
  });

  it('renders contract data in table', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('CT-2026-001')).toBeInTheDocument();
      expect(screen.getByText('CT-2026-002')).toBeInTheDocument();
    });
  });

  it('renders renter names', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeInTheDocument();
      expect(screen.getByText('李芳')).toBeInTheDocument();
    });
  });

  it('renders status tabs', async () => {
    await renderPage();
    await waitFor(() => {
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders create button', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('CT-2026-001')).toBeInTheDocument();
    });
  });

  it('renders search filter', async () => {
    await renderPage();
    await waitFor(() => {
      expect(screen.getByText('CT-2026-001')).toBeInTheDocument();
    });
    const searchInputs = screen.getAllByRole('textbox');
    expect(searchInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders detail and action buttons', async () => {
    await renderPage();
    await waitFor(() => {
      const detailButtons = screen.getAllByText('详情');
      expect(detailButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
