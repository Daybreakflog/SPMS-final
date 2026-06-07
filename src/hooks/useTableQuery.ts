import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { PageResult, PageParams } from '@/types';

interface UseTableQueryOptions<TData, TFilter extends object> {
  queryKey: string;
  queryFn: (params: TFilter & PageParams) => Promise<PageResult<TData>>;
  defaultFilter?: Partial<TFilter>;
  defaultPageSize?: number;
  syncToUrl?: boolean;
}

export function useTableQuery<TData, TFilter extends object>(
  options: UseTableQueryOptions<TData, TFilter>,
) {
  const {
    queryKey,
    queryFn,
    defaultFilter = {} as Partial<TFilter>,
    defaultPageSize = 20,
    syncToUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = syncToUrl ? Number(searchParams.get('page')) || 1 : 1;
  const initialPageSize = syncToUrl
    ? Number(searchParams.get('pageSize')) || defaultPageSize
    : defaultPageSize;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filter, setFilter] = useState<Partial<TFilter>>(defaultFilter);

  const params = useMemo(
    () => ({ ...filter, page, pageSize }) as TFilter & PageParams,
    [filter, page, pageSize],
  );

  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => queryFn(params),
    placeholderData: (prev) => prev,
  });

  const onPageChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage);
      setPageSize(newPageSize);
      if (syncToUrl) {
        setSearchParams((prev) => {
          prev.set('page', String(newPage));
          prev.set('pageSize', String(newPageSize));
          return prev;
        });
      }
    },
    [syncToUrl, setSearchParams],
  );

  const onFilterChange = useCallback(
    (newFilter: Partial<TFilter>) => {
      setFilter(newFilter);
      setPage(1);
      if (syncToUrl) {
        setSearchParams((prev) => {
          prev.set('page', '1');
          return prev;
        });
      }
    },
    [syncToUrl, setSearchParams],
  );

  const onReset = useCallback(() => {
    setFilter(defaultFilter);
    setPage(1);
    setPageSize(defaultPageSize);
    if (syncToUrl) {
      setSearchParams({});
    }
  }, [defaultFilter, defaultPageSize, syncToUrl, setSearchParams]);

  return {
    data: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page,
    pageSize,
    loading: query.isLoading || query.isFetching,
    filter,
    onPageChange,
    onFilterChange,
    onReset,
    refetch: query.refetch,
  };
}
