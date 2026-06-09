import { http } from '@/api/request';
import type {
  PageResult,
  FeeItem,
  FeeItemListParams,
  FeeItemCreateDTO,
  FeeItemUpdateDTO,
  Bill,
  BillListParams,
  BillManualCreateDTO,
  BillGenerateDTO,
  BillGenerateResult,
} from '@/types';

export const billingService = {
  // Fee Items
  feeItemList: (params: FeeItemListParams) =>
    http.get<PageResult<FeeItem>>('/billing/fee-items', params),

  feeItemDetail: (id: string) =>
    http.get<FeeItem>(`/billing/fee-items/${id}`),

  feeItemCreate: (data: FeeItemCreateDTO) =>
    http.post<FeeItem>('/billing/fee-items', data),

  feeItemUpdate: (id: string, data: FeeItemUpdateDTO) =>
    http.patch<FeeItem>(`/billing/fee-items/${id}`, data),

  feeItemRemove: (id: string) =>
    http.delete<void>(`/billing/fee-items/${id}`),

  // Bills
  billList: (params: BillListParams) =>
    http.get<PageResult<Bill>>('/billing/bills', params),

  billDetail: (id: string) =>
    http.get<Bill>(`/billing/bills/${id}`),

  billManualCreate: (data: BillManualCreateDTO) =>
    http.post<Bill>('/billing/bills/manual', data),

  billGenerate: (data: BillGenerateDTO) =>
    http.post<BillGenerateResult>('/billing/bills/generate', data),

  billPublish: (ids: string[]) =>
    http.post<void>('/billing/bills/publish', { billIds: ids }),

  // Meter Readings
  meterReadingTemplate: () =>
    http.get<Blob>('/excel/meter-readings/template', undefined, { responseType: 'blob' }),

  meterReadingImport: (formData: FormData) =>
    http.post<{ success: number; failed: number; errors?: string[] }>('/billing/meter-readings/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
