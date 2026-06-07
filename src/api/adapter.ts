import type { AxiosResponse } from 'axios';

interface WrappedResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

function isWrappedResponse(data: unknown): data is WrappedResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'data' in data &&
    typeof (data as WrappedResponse).code === 'number'
  );
}

export function unwrapResponse(response: AxiosResponse): AxiosResponse {
  if (isWrappedResponse(response.data) && response.data.code === 200) {
    response.data = response.data.data;
  }
  return response;
}
