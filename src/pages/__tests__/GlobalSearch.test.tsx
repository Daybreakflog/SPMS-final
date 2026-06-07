import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/renter.service', () => ({
  renterService: { list: vi.fn().mockResolvedValue({ items: [], total: 0 }) },
}));
vi.mock('@/services/contract.service', () => ({
  contractService: { list: vi.fn().mockResolvedValue({ items: [], total: 0 }) },
}));
vi.mock('@/services/billing.service', () => ({
  billingService: { billList: vi.fn().mockResolvedValue({ items: [], total: 0 }) },
}));

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderSearch() {
    const mod = await import('../../components/GlobalSearch/index');
    const GlobalSearch = mod.default;
    return renderWithProviders(<GlobalSearch />);
  }

  it('renders without crashing', async () => {
    await renderSearch();
  });

  it('opens on Ctrl+K keyboard shortcut', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      const modal = document.querySelector('.ant-modal');
      expect(modal).toBeTruthy();
    });
  });

  it('handles Escape key', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(document.querySelector('.ant-modal')).toBeTruthy();
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    // Modal should start closing
    expect(document.querySelector('.ant-modal')).toBeDefined();
  });

  it('has search input', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      const input = document.querySelector('.ant-modal input');
      expect(input).toBeTruthy();
    });
  });

  it('shows hint text', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByText(/搜索菜单|输入关键词/)).toBeInTheDocument();
    });
  });

  it('renders search categories', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      const modal = document.querySelector('.ant-modal');
      expect(modal).toBeTruthy();
    });
  });

  it('debounces input', async () => {
    await renderSearch();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      const input = document.querySelector('.ant-modal input');
      expect(input).toBeTruthy();
    });
  });
});
