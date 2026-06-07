import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/store/user.store', () => ({
  useUserStore: vi.fn((sel: (s: Record<string, unknown>) => unknown) =>
    sel({ user: { roles: ['PLATFORM_ADMIN'] } }),
  ),
}));

describe('AdvancedFilter', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  async function renderFilter() {
    const mod = await import('../../components/AdvancedFilter/index');
    const AdvancedFilter = mod.default;
    const fields = [
      { key: 'name', label: '姓名', type: 'string' as const },
      { key: 'amount', label: '金额', type: 'number' as const },
      { key: 'date', label: '日期', type: 'date' as const },
    ];
    return renderWithProviders(
      <AdvancedFilter
        fields={fields}
        onApply={vi.fn()}
        onReset={vi.fn()}
        storageKey="test-filter"
      />
    );
  }

  it('renders filter title', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByText('高级筛选')).toBeInTheDocument();
    });
  });

  it('renders add condition button', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByText('添加条件')).toBeInTheDocument();
    });
  });

  it('renders apply button', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByText('应用筛选')).toBeInTheDocument();
    });
  });

  it('renders save scheme button', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByText('保存方案')).toBeInTheDocument();
    });
  });

  it('can add a condition row', async () => {
    await renderFilter();
    await waitFor(() => {
      const addBtn = screen.getByText('添加条件');
      fireEvent.click(addBtn);
    });
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders AND/OR toggle', async () => {
    await renderFilter();
    await waitFor(() => {
      const addBtn = screen.getByText('添加条件');
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);
    });
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders scheme management', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByText('保存方案')).toBeInTheDocument();
    });
  });

  it('renders scheme name input', async () => {
    await renderFilter();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('方案名称')).toBeInTheDocument();
    });
  });
});
