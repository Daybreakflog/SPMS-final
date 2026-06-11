import { http, HttpResponse } from 'msw';

const renterNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛', '林敏', '何磊', '郭芳'];
const _creatorNames = ['客服小王', '客服小李', '客服张三', '管理员赵四'];

function makeApprovalRecords(status: string, i: number) {
  const records = [
    { id: `ar-${i}-1`, action: 'CREATE', operatorId: `user-cs-${(i % 4) + 1}`, operatorName: _creatorNames[i % 4], remark: '创建合同草稿', createdAt: new Date(2025, 0, 5 + i).toISOString() },
  ];
  if (status === 'DRAFT') return records;
  records.push({ id: `ar-${i}-2`, action: 'SUBMIT', operatorId: `user-cs-${(i % 4) + 1}`, operatorName: _creatorNames[i % 4], remark: '提交审批', createdAt: new Date(2025, 0, 6 + i).toISOString() });
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
  const renterProfileId = `renter-${String((i % 15) + 1).padStart(3, '0')}`;
  const unitId = `unit-${String((i % 10) + 1).padStart(3, '0')}`;
  const projectId = `project-${String((i % 3) + 1).padStart(3, '0')}`;
  const unitCode = `${Math.floor(i / 3) + 1}${String((i % 4) + 1).padStart(2, '0')}`;
  return {
    id: `contract-${String(i + 1).padStart(3, '0')}`,
    contractNo: `HT-2025-${String(i + 1).padStart(4, '0')}`,
    renterProfileId,
    renterProfile: { id: renterProfileId, name: renterNames[i % renterNames.length], phone: `1380000${String(i).padStart(4, '0')}` },
    unitId,
    unit: { id: unitId, name: `${(i % 3) + 1}号楼-${unitCode}`, code: unitCode },
    projectId,
    project: { id: projectId, name: `示例项目${(i % 3) + 1}` },
    startDate: new Date(2025, startMonth, 1).toISOString().split('T')[0],
    endDate: new Date(2026, startMonth, 0).toISOString().split('T')[0],
    rentAmount: String(2000 + i * 300),
    depositAmount: String(2000 + i * 300),
    paymentMethod: cycles[i % 3],
    status,
    createdById: `user-cs-${(i % 4) + 1}`,
    attachmentUrl: null,
    terms: i % 4 === 0 ? '标准租赁合同' : null,
    approvalRecords: makeApprovalRecords(status, i),
    createdAt: new Date(2025, 0, 5 + i).toISOString(),
    updatedAt: new Date(2025, 1, 1 + i).toISOString(),
  };
});

export const contractHandlers = [
  http.get('/api/contracts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');

    let filtered = [...contracts];
    if (keyword) {
      filtered = filtered.filter(
        (c) =>
          c.contractNo.includes(keyword) ||
          c.renterProfile.name.includes(keyword) ||
          (c.unit?.name ?? '').includes(keyword),
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
    const renterProfileId = body.renterProfileId as string || '';
    const unitId = body.unitId as string || '';
    const projectId = body.projectId as string || '';
    const newContract = {
      id: `contract-${String(contracts.length + 1).padStart(3, '0')}`,
      contractNo: (body.contractNo as string) || `HT-2025-${String(contracts.length + 1).padStart(4, '0')}`,
      renterProfileId,
      renterProfile: { id: renterProfileId, name: '新租户' },
      unitId,
      unit: unitId ? { id: unitId, name: '新房间' } : null,
      projectId,
      project: { id: projectId, name: '项目' },
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      rentAmount: String(body.rentAmount ?? 0),
      depositAmount: String(body.depositAmount ?? 0),
      paymentMethod: (body.paymentMethod as string) || 'MONTHLY',
      status: 'DRAFT',
      createdById: 'current-user',
      attachmentUrl: null,
      terms: (body.terms as string) || null,
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
      rentAmount: body.rentAmount != null ? String(body.rentAmount) : original.rentAmount,
      depositAmount: body.depositAmount != null ? String(body.depositAmount) : original.depositAmount,
      paymentMethod: (body.paymentMethod as string) || original.paymentMethod,
      status: 'DRAFT',
      terms: (body.remark as string) || null,
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
