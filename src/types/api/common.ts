export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  data: null;
}
