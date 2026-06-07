import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
}

interface UsePaginationReturn extends PaginationState {
  onChange: (page: number, pageSize: number) => void;
  reset: () => void;
}

export function usePagination(defaultPageSize = 20): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: defaultPageSize,
  });

  const onChange = useCallback((page: number, pageSize: number) => {
    setState({ page, pageSize });
  }, []);

  const reset = useCallback(() => {
    setState({ page: 1, pageSize: defaultPageSize });
  }, [defaultPageSize]);

  return { ...state, onChange, reset };
}
