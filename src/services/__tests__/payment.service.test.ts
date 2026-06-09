import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/request', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}));

import { paymentService } from '../payment.service';
import { http } from '@/api/request';

const m = http as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('paymentService', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.values(m).forEach((fn) => fn.mockResolvedValue({})); });

  it('list 调用 GET /payments/orders', async () => {
    await paymentService.list({ page: 1 });
    expect(m.get).toHaveBeenCalledWith('/payments/orders', { page: 1 });
  });

  it('detail 调用 GET /payments/orders/:id', async () => {
    await paymentService.detail('po-001');
    expect(m.get).toHaveBeenCalledWith('/payments/orders/po-001');
  });

  it('mockSuccess 调用 POST /payments/mock/success', async () => {
    await paymentService.mockSuccess('ORDER-001');
    expect(m.post).toHaveBeenCalledWith('/payments/mock/success', { orderNo: 'ORDER-001' });
  });

  it('list 传递 status 参数', async () => {
    await paymentService.list({ page: 1, status: 'SUCCESS' });
    expect(m.get).toHaveBeenCalledWith('/payments/orders', expect.objectContaining({ status: 'SUCCESS' }));
  });

  it('list 传递 renterAccountId 参数', async () => {
    await paymentService.list({ page: 1, renterAccountId: 'renter-001' });
    expect(m.get).toHaveBeenCalledWith('/payments/orders', expect.objectContaining({ renterAccountId: 'renter-001' }));
  });

  it('detail 使用正确的 id 路径', async () => {
    await paymentService.detail('po-999');
    expect(m.get).toHaveBeenCalledWith('/payments/orders/po-999');
  });

  it('list 默认参数调用一次', async () => {
    await paymentService.list({ page: 1, pageSize: 10 });
    expect(m.get).toHaveBeenCalledTimes(1);
  });
});
