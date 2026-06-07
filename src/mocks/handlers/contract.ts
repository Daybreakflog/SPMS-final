import { http, HttpResponse } from 'msw';

const renterNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛', '林敏', '何磊', '郭芳'];
const creatorNames = ['客服小王', '客服小李', '客服张三', '管理员赵四'];

function makeApprovalRecords(status: string, i: number) {
  const records = [
    { id: `ar-${i}-1`, action: 'CREATE', operatorId: `user-cs-${(i % 4) + 1}`, operatorName: creatorNames[i % 4], remark: '创建合同草稿', createdAt: new Date(2025, 0, 5 + i).toISOString() },
  ];
  if (status === 'DRAFT') return records;
  records.push({ id: `ar-${i}-2`, action: 'SUBMIT', operatorId: `user-cs-${(i % 4) + 1}`, operatorName: creatorNames[i % 4], remark: '提交审批', createdAt: new Date(2025, 0, 6 + i).toISOString() });
  if (status === 'PENDING_FINANCE') return records;
  if (status === 'REJECTED' && i % 3 === 0) {
    records.push({ id: `ar-${i}-3`, action: 'FINANCE_REJECT', operatorId: 'user-fin-1', operatorName: '财务李四', remark: '租金金额有误', createdAt: new Date(2025, 0, 7 + i).toISOString() });
    return records;
  }
  records.push({ id: `ar-${i}-3`, action: 'FINANCE_APPROVE', operatorId: 'user-fin-1', operatorName: '财务李四', remark: '财务审批通过', createdAt: new Date(2025, 0, 7 + i).toISOString() });
  if (status === 'PENDING_ADMIN') return records;
  if (status === 'REJECTED') {
    records.push({ id: `ar-${i}-4`, action: 'ADMIN_REJECT', operatorId: 'user-admin-1', operatorName: '管理员赵四', remark: '条款需修改', createdAt: new Date(2025, 0, 8 + i).toISOString() });
    return records;
  }
  records.push({ id: `ar-${i}-4`, action: 'ADMIN_SIGN', operatorId: 'user-admin-1', operatorName: '管理员赵四', remark: '已签署', createdAt: new Date(2025, 0, 8 + i).toISOString() });
  if (status === 'TERMINATED') {
    records.push({ id: `ar-${i}-5`, action: 'TERMINATE', operatorId: 'user-admin-1', operatorName: '管理员赵四', remark: '提前终止', createdAt: new Date(2025, 2, 1 + i).toISOString() });
  }
  return records;
}

function pickStatus(i: number): string {
  const distribution = [
    'DRAFT', 'DRAFT',
    'PENDING_FINANCE', 'PENDING_FINANCE',
    'PENDING_ADMIN', 'PENDING_ADMIN',
    'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE',
    'REJECTED', 'REJECTED',
    'TERMINATED', 'TERMINATED',
    'ACTIVE', 'ACTIVE', 'DRAFT',
  ];
  return distribution[i % distribution.length];
}

const contracts = Array.from({ length: 18 }, (_, i) => {
  const status = pickStatus(i);
  const startMonth = (i % 12);
  const cycles = ['MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
  return {
    id: `contract-${String(i + 1).padStart(3, '0')}`,
    contractNo: `HT-2025-${String(i + 1).padStart(4, '0')}`,
    renterId: `renter-${String((i % 15) + 1).padStart(3, '0')}`,
    renterName: renterNames[i % renterNames.length],
    renterIdNumber: `110101199${String(i).padStart(1, '0')}0101${String(1000 + i * 37).slice(0, 4)}`,
    unitId: `unit-${String((i % 10) + 1).padStart(3, '0')}`,
    unitNumber: `${Math.floor(i / 3) + 1}${String((i % 4) + 1).padStart(2, '0')}`,
    buildingName: `${(i % 3) + 1}号楼`,
    projectId: `project-${String((i % 3) + 1).padStart(3, '0')}`,
    projectName: `示例项目${(i % 3) + 1}`,
    startDate: new Date(2025, startMonth, 1).toISOString().split('T')[0],
    endDate: new Date(2026, startMonth, 0).toISOString().split('T')[0],
    monthlyRent: 2000 + i * 300,
    deposit: 2000 + i * 300,
    paymentCycle: cycles[i % 3],
    status,
    creatorId: `user-cs-${(i % 4) + 1}`,
    creatorName: creatorNames[i % 4],
    attachments: [],
    remark: i % 4 === 0 ? '标准租赁合同' : undefined,
    approvalRecords: makeApprovalRecords(status, i),
    createdAt: new Date(2025, 0, 5 + i).toISOString(),
    updatedAt: new Date(2025, 1, 1 + i).toISOString(),
  };
});

export const contractHandlers = [
  http.get('/api/contracts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');

    let filtered = [...contracts];
    if (keyword) {
      filtered = filtered.filter(
        (c) =>
          c.contractNo.includes(keyword) ||
          c.renterName.includes(keyword) ||
          c.unitNumber.includes(keyword),
      );
    }
    if (status) filtered = filtered.filter((c) => c.status === status);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/contracts/:id', ({ params }) => {
    const contract = contracts.find((c) => c.id === params.id);
    if (!contract) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(contract);
  }),

  http.post('/api/contracts', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newContract = {
      id: `contract-${String(contracts.length + 1).padStart(3, '0')}`,
      contractNo: `HT-2025-${String(contracts.length + 1).padStart(4, '0')}`,
      renterId: body.renterId as string,
      renterName: body.renterName as string || '新租户',
      renterIdNumber: '',
      unitId: body.unitId as string,
      unitNumber: body.unitNumber as string || '',
      buildingName: body.buildingName as string || '',
      projectId: body.projectId as string || '',
      projectName: body.projectName as string || '',
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      monthlyRent: body.monthlyRent as number,
      deposit: body.deposit as number,
      paymentCycle: (body.paymentCycle as string) || 'MONTHLY',
      status: 'DRAFT',
      creatorId: 'current-user',
      creatorName: '当前用户',
      attachments: (body.attachments as string[]) || [],
      remark: body.remark as string | undefined,
      approvalRecords: [{
        id: `ar-new-1`,
        action: 'CREATE',
        operatorId: 'current-user',
        operatorName: '当前用户',
        remark: '创建合同草稿',
        createdAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contracts.push(newContract as typeof contracts[0]);
    return HttpResponse.json(newContract, { status: 201 });
  }),

  http.patch('/api/contracts/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx] = { ...contracts[idx], ...body, updatedAt: new Date().toISOString() } as typeof contracts[0];
    return HttpResponse.json(contracts[idx]);
  }),

  http.delete('/api/contracts/:id', ({ params }) => {
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts.splice(idx, 1);
    return HttpResponse.json(null, { status: 204 });
  }),

  http.post('/api/contracts/:id/submit', ({ params }) => {
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'PENDING_FINANCE';
    contracts[idx].approvalRecords.push({
      id: `ar-submit-${Date.now()}`,
      action: 'SUBMIT',
      operatorId: 'current-user',
      operatorName: '当前用户',
      remark: '提交审批',
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/finance/approve', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'PENDING_ADMIN';
    contracts[idx].approvalRecords.push({
      id: `ar-fa-${Date.now()}`,
      action: 'FINANCE_APPROVE',
      operatorId: 'current-user',
      operatorName: '财务审批员',
      remark: (body.remark as string) || '审批通过',
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/finance/reject', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'REJECTED';
    contracts[idx].approvalRecords.push({
      id: `ar-fr-${Date.now()}`,
      action: 'FINANCE_REJECT',
      operatorId: 'current-user',
      operatorName: '财务审批员',
      remark: body.reason as string,
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/admin/sign', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'ACTIVE';
    contracts[idx].approvalRecords.push({
      id: `ar-as-${Date.now()}`,
      action: 'ADMIN_SIGN',
      operatorId: 'current-user',
      operatorName: '管理员',
      remark: (body.remark as string) || '已签署',
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/admin/reject', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'REJECTED';
    contracts[idx].approvalRecords.push({
      id: `ar-ar-${Date.now()}`,
      action: 'ADMIN_REJECT',
      operatorId: 'current-user',
      operatorName: '管理员',
      remark: body.reason as string,
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/terminate', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = contracts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    contracts[idx].status = 'TERMINATED';
    contracts[idx].approvalRecords.push({
      id: `ar-t-${Date.now()}`,
      action: 'TERMINATE',
      operatorId: 'current-user',
      operatorName: '管理员',
      remark: body.reason as string,
      createdAt: new Date().toISOString(),
    });
    contracts[idx].updatedAt = new Date().toISOString();
    return HttpResponse.json(contracts[idx]);
  }),

  http.post('/api/contracts/:id/renew', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const original = contracts.find((c) => c.id === params.id);
    if (!original) {
      return HttpResponse.json({ code: 404, message: '合同不存在', data: null }, { status: 404 });
    }
    const renewed = {
      ...original,
      id: `contract-${String(contracts.length + 1).padStart(3, '0')}`,
      contractNo: `HT-2025-${String(contracts.length + 1).padStart(4, '0')}`,
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      monthlyRent: body.monthlyRent as number ?? original.monthlyRent,
      deposit: body.deposit as number ?? original.deposit,
      paymentCycle: (body.paymentCycle as string) || original.paymentCycle,
      status: 'DRAFT',
      remark: body.remark as string | undefined,
      approvalRecords: [{
        id: `ar-renew-1`,
        action: 'CREATE',
        operatorId: 'current-user',
        operatorName: '当前用户',
        remark: `续签自合同 ${original.contractNo}`,
        createdAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contracts.push(renewed as typeof contracts[0]);
    return HttpResponse.json(renewed, { status: 201 });
  }),
];
