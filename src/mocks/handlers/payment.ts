import { http, HttpResponse } from 'msw';

const renterNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛'];

const channels = ['WECHAT', 'ALIPAY', 'BANK'] as const;
const statuses = ['PENDING', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'PENDING', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'PENDING', 'SUCCESS'] as const;

const payments = Array.from({ length: 15 }, (_, i) => {
  const status = statuses[i];
  return {
    id: `pay-${String(i + 1).padStart(3, '0')}`,
    orderNo: `PAY-2025-${String(i + 1).padStart(5, '0')}`,
    renterId: `renter-${String((i % 15) + 1).padStart(3, '0')}`,
    renterName: renterNames[i % renterNames.length],
    amount: 1500 + i * 800,
    channel: channels[i % 3],
    status,
    billCount: (i % 3) + 1,
    description: `缴纳${['物业费', '租金', '水电费'][i % 3]}`,
    paidAt: status === 'SUCCESS' ? new Date(2025, 1 + Math.floor(i / 4), 5 + (i % 20)).toISOString() : undefined,
    createdAt: new Date(2025, 1 + Math.floor(i / 4), 3 + (i % 20)).toISOString(),
  };
});

export const paymentHandlers = [
  http.get('/api/payments/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const channel = url.searchParams.get('channel');

    let filtered = [...payments];
    if (keyword) filtered = filtered.filter((p) => p.orderNo.includes(keyword) || p.renterName.includes(keyword));
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (channel) filtered = filtered.filter((p) => p.channel === channel);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/payments/orders/:id', ({ params }) => {
    const payment = payments.find((p) => p.id === params.id);
    if (!payment) return HttpResponse.json({ code: 404, message: '订单不存在', data: null }, { status: 404 });
    return HttpResponse.json(payment);
  }),

  http.post('/api/payments/mock/success', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const orderNo = body.orderNo as string;
    const payment = payments.find((p) => p.orderNo === orderNo);
    if (payment) {
      (payment as { status: string }).status = 'SUCCESS';
      (payment as { paidAt: string }).paidAt = new Date().toISOString();
    }
    return HttpResponse.json({ success: true });
  }),
];
