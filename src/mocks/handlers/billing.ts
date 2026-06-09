import { http, HttpResponse } from 'msw';

const projectNames = ['示例项目1', '示例项目2', '示例项目3'];

const feeItems = [
  { id: 'fi-001', name: '物业管理费', code: 'WY-001', billingRule: 'FIXED' as const, unitPrice: 3.5, unit: '元/月', cycle: 'MONTHLY' as const, projectId: 'project-001', projectName: '示例项目1', status: 'ACTIVE' as const, remark: '固定物业管理费', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'fi-002', name: '租金', code: 'ZJ-001', billingRule: 'BY_AREA' as const, unitPrice: 45, unit: '元/㎡', cycle: 'MONTHLY' as const, projectId: 'project-001', projectName: '示例项目1', status: 'ACTIVE' as const, remark: '按面积计算租金', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
  { id: 'fi-003', name: '电费', code: 'DF-001', billingRule: 'BY_METER' as const, unitPrice: 0.8, unit: '元/度', cycle: 'MONTHLY' as const, projectId: 'project-001', projectName: '示例项目1', status: 'ACTIVE' as const, remark: '按电表读数计费', createdAt: '2025-01-03T00:00:00Z', updatedAt: '2025-01-03T00:00:00Z' },
  { id: 'fi-004', name: '水费', code: 'SF-001', billingRule: 'BY_METER' as const, unitPrice: 4.5, unit: '元/吨', cycle: 'MONTHLY' as const, projectId: 'project-002', projectName: '示例项目2', status: 'ACTIVE' as const, remark: '按水表读数计费', createdAt: '2025-01-04T00:00:00Z', updatedAt: '2025-01-04T00:00:00Z' },
  { id: 'fi-005', name: '停车费', code: 'TC-001', billingRule: 'FIXED' as const, unitPrice: 300, unit: '元/月', cycle: 'MONTHLY' as const, projectId: 'project-002', projectName: '示例项目2', status: 'ACTIVE' as const, remark: '固定车位月租', createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z' },
  { id: 'fi-006', name: '卫生费', code: 'WS-001', billingRule: 'FIXED' as const, unitPrice: 50, unit: '元/月', cycle: 'QUARTERLY' as const, projectId: 'project-001', projectName: '示例项目1', status: 'ACTIVE' as const, remark: '公共区域卫生', createdAt: '2025-01-06T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z' },
  { id: 'fi-007', name: '空调费', code: 'KT-001', billingRule: 'BY_AREA' as const, unitPrice: 8, unit: '元/㎡', cycle: 'QUARTERLY' as const, projectId: 'project-003', projectName: '示例项目3', status: 'ACTIVE' as const, remark: '中央空调按面积分摊', createdAt: '2025-01-07T00:00:00Z', updatedAt: '2025-01-07T00:00:00Z' },
  { id: 'fi-008', name: '网络费', code: 'WL-001', billingRule: 'FIXED' as const, unitPrice: 200, unit: '元/月', cycle: 'YEARLY' as const, projectId: 'project-002', projectName: '示例项目2', status: 'DISABLED' as const, remark: '宽带年费', createdAt: '2025-01-08T00:00:00Z', updatedAt: '2025-01-08T00:00:00Z' },
  { id: 'fi-009', name: '天然气费', code: 'RQ-001', billingRule: 'BY_METER' as const, unitPrice: 3.2, unit: '元/m³', cycle: 'MONTHLY' as const, projectId: 'project-003', projectName: '示例项目3', status: 'ACTIVE' as const, remark: '按气表读数计费', createdAt: '2025-01-09T00:00:00Z', updatedAt: '2025-01-09T00:00:00Z' },
  { id: 'fi-010', name: '装修保证金', code: 'ZX-001', billingRule: 'FIXED' as const, unitPrice: 5000, unit: '元', cycle: 'ONE_TIME' as const, projectId: 'project-001', projectName: '示例项目1', status: 'ACTIVE' as const, remark: '一次性收取', createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
];

const renterNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛', '林敏', '何磊', '郭芳', '马丽', '罗刚'];

function pickBillStatus(i: number): 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' {
  const dist: Array<'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE'> = [
    'UNPAID', 'UNPAID', 'UNPAID', 'UNPAID',
    'PARTIAL', 'PARTIAL', 'PARTIAL',
    'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID',
    'OVERDUE', 'OVERDUE', 'OVERDUE',
    'UNPAID', 'PAID', 'PARTIAL', 'OVERDUE',
  ];
  return dist[i % dist.length];
}

const bills = Array.from({ length: 20 }, (_, i) => {
  const status = pickBillStatus(i);
  const amount = 1000 + i * 500;
  const paidAmount = status === 'PAID' ? amount : status === 'PARTIAL' ? Math.floor(amount * 0.4) : 0;
  const feeItem = feeItems[i % feeItems.length];
  const dueDate = new Date(2025, 2 + Math.floor(i / 5), 15);
  const isPast = dueDate < new Date();
  return {
    id: `bill-${String(i + 1).padStart(3, '0')}`,
    billNo: `ZD-2025-${String(i + 1).padStart(5, '0')}`,
    renterId: `renter-${String((i % 15) + 1).padStart(3, '0')}`,
    renterName: renterNames[i % renterNames.length],
    unitId: `unit-${String((i % 10) + 1).padStart(3, '0')}`,
    unitNumber: `${Math.floor(i / 3) + 1}${String((i % 4) + 1).padStart(2, '0')}`,
    feeItemId: feeItem.id,
    feeItemName: feeItem.name,
    period: `2025-${String((i % 12) + 1).padStart(2, '0')}`,
    amount,
    paidAmount,
    balance: amount - paidAmount,
    status: isPast && status === 'UNPAID' ? 'OVERDUE' as const : status,
    dueDate: dueDate.toISOString().split('T')[0],
    published: i % 3 !== 0,
    remark: i % 5 === 0 ? '备注信息' : undefined,
    paymentRecords: paidAmount > 0 ? [
      { id: `pr-${i}-1`, orderNo: `PAY-2025-${String(i + 1).padStart(5, '0')}`, amount: paidAmount, channel: (['WECHAT', 'ALIPAY', 'BANK'] as const)[i % 3], paidAt: new Date(2025, 1 + Math.floor(i / 5), 10 + (i % 10)).toISOString() },
    ] : [],
    projectId: `project-${String((i % 3) + 1).padStart(3, '0')}`,
    projectName: projectNames[i % 3],
    createdAt: new Date(2025, 0, 15 + i).toISOString(),
    updatedAt: new Date(2025, 1, 1 + i).toISOString(),
  };
});

export const billingHandlers = [
  // Fee Items CRUD
  http.get('/api/billing/fee-items', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const billingRule = url.searchParams.get('billingRule');
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');

    let filtered = [...feeItems];
    if (keyword) filtered = filtered.filter((f) => f.name.includes(keyword) || (f.code && f.code.includes(keyword)));
    if (billingRule) filtered = filtered.filter((f) => f.billingRule === billingRule);
    if (projectId) filtered = filtered.filter((f) => f.projectId === projectId);
    if (status) filtered = filtered.filter((f) => f.status === status);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/billing/fee-items/:id', ({ params }) => {
    const item = feeItems.find((f) => f.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '费项不存在', data: null }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/api/billing/fee-items', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newItem = {
      id: `fi-${String(feeItems.length + 1).padStart(3, '0')}`,
      name: body.name as string,
      code: body.code as string || '',
      billingRule: body.billingRule as 'FIXED' | 'BY_AREA' | 'BY_METER',
      unitPrice: body.unitPrice as number,
      unit: body.unit as string || '元',
      cycle: body.cycle as string || 'MONTHLY',
      projectId: body.projectId as string || '',
      projectName: body.projectName as string || '',
      status: (body.status as string) || 'ACTIVE',
      remark: body.remark as string || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    feeItems.push(newItem as typeof feeItems[0]);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.patch('/api/billing/fee-items/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = feeItems.findIndex((f) => f.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '费项不存在', data: null }, { status: 404 });
    feeItems[idx] = { ...feeItems[idx], ...body, updatedAt: new Date().toISOString() } as typeof feeItems[0];
    return HttpResponse.json(feeItems[idx]);
  }),

  http.delete('/api/billing/fee-items/:id', ({ params }) => {
    const idx = feeItems.findIndex((f) => f.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '费项不存在', data: null }, { status: 404 });
    feeItems.splice(idx, 1);
    return HttpResponse.json(null, { status: 204 });
  }),

  // Bills
  http.get('/api/billing/bills', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const feeItemId = url.searchParams.get('feeItemId');
    const renterId = url.searchParams.get('renterId');

    const unitId = url.searchParams.get('unitId');

    let filtered = [...bills];
    if (keyword) filtered = filtered.filter((b) => b.billNo.includes(keyword) || b.renterName.includes(keyword) || b.unitNumber.includes(keyword));
    if (status) filtered = filtered.filter((b) => b.status === status);
    if (feeItemId) filtered = filtered.filter((b) => b.feeItemId === feeItemId);
    if (renterId) filtered = filtered.filter((b) => b.renterId === renterId);
    if (unitId) filtered = filtered.filter((b) => b.unitId === unitId);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/billing/bills/:id', ({ params }) => {
    const bill = bills.find((b) => b.id === params.id);
    if (!bill) return HttpResponse.json({ code: 404, message: '账单不存在', data: null }, { status: 404 });
    return HttpResponse.json(bill);
  }),

  http.post('/api/billing/bills/manual', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newBill = {
      id: `bill-${String(bills.length + 1).padStart(3, '0')}`,
      billNo: `ZD-2025-${String(bills.length + 1).padStart(5, '0')}`,
      renterId: body.renterId as string,
      renterName: body.renterName as string || '新租户',
      unitId: body.unitId as string,
      unitNumber: body.unitNumber as string || '',
      feeItemId: body.feeItemId as string,
      feeItemName: body.feeItemName as string || '',
      period: body.period as string,
      amount: body.amount as number,
      paidAmount: 0,
      balance: body.amount as number,
      status: 'UNPAID' as const,
      dueDate: body.dueDate as string || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      published: false,
      remark: body.remark as string || undefined,
      paymentRecords: [],
      projectId: '',
      projectName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bills.push(newBill);
    return HttpResponse.json(newBill, { status: 201 });
  }),

  http.post('/api/billing/bills/generate', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const projectIds = body.projectIds as string[];
    const feeItemIds = body.feeItemIds as string[];
    const created = projectIds.length * feeItemIds.length * 3;
    return HttpResponse.json({ total: created + 2, created, skipped: 2 });
  }),

  http.post('/api/billing/bills/publish', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const ids = body.ids as string[];
    ids.forEach((id) => {
      const bill = bills.find((b) => b.id === id);
      if (bill) bill.published = true;
    });
    return HttpResponse.json({ success: true });
  }),

  // Meter readings
  http.get('/api/excel/meter-readings/template', () => {
    return HttpResponse.json({ message: '模板下载（mock）' });
  }),

  http.post('/api/billing/meter-readings/import', () => {
    return HttpResponse.json({ success: 8, failed: 2, errors: ['第3行：单元号不存在', '第7行：读数格式错误'] });
  }),
];
