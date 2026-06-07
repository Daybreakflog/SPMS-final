import { http } from '@/api/request';
import type { PageResult, PaymentOrder, PaymentOrderListParams } from '@/types';

export const paymentService = {
  list: (params: PaymentOrderListParams) =>
    http.get<PageResult<PaymentOrder>>('/payments/orders', params),

  detail: (id: string) =>
    http.get<PaymentOrder>(`/payments/orders/${id}`),

  mockSuccess: (orderNo: string) =>
    http.post<void>('/payments/mock/success', { orderNo }),
};
