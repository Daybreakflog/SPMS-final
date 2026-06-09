import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableQuery } from '../useTableQuery';

vi.mock('react-router-dom', () => {
  const params = new URLSearchParams();
  return {
    useSearchParams: () => [params, vi.fn()],
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: { items: [{ id: '1' }], total: 1 },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

describe('useTableQuery', () => {
  const mockQueryFn = vi.fn().mockResolvedValue({ items: [], total: 0 });

  it('returns correct initial state', () => {
    const { result } = renderHook(() =>
      useTableQuery({
        queryKey: 'test',
        queryFn: mockQueryFn,
      }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.data).toEqual([{ id: '1' }]);
    expect(result.current.total).toBe(1);
    expect(result.current.loading).toBe(false);
  });

  it('updates page on onPageChange', () => {
    const { result } = renderHook(() =>
      useTableQuery({
        queryKey: 'test',
        queryFn: mockQueryFn,
      }),
    );

    act(() => {
      result.current.onPageChange(2, 10);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(10);
  });

  it('resets page to 1 on onFilterChange', () => {
    const { result } = renderHook(() =>
      useTableQuery<{ id: string }, { keyword: string }>({
        queryKey: 'test',
        queryFn: mockQueryFn,
      }),
    );

    act(() => {
      result.current.onPageChange(3, 20);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.onFilterChange({ keyword: 'test' });
    });
    expect(result.current.page).toBe(1);
    expect(result.current.filter).toEqual({ keyword: 'test' });
  });

  it('resets all state on onReset', () => {
    const { result } = renderHook(() =>
      useTableQuery<{ id: string }, { keyword: string }>({
        queryKey: 'test',
        queryFn: mockQueryFn,
        defaultPageSize: 15,
      }),
    );

    act(() => {
      result.current.onPageChange(5, 50);
      result.current.onFilterChange({ keyword: 'hello' });
    });

    act(() => {
      result.current.onReset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(15);
    expect(result.current.filter).toEqual({});
  });
});
