import { http, HttpResponse } from 'msw';

const leases = Array.from({ length: 20 }, (_, i) => {
  const isActive = i < 14;
  return {
    id: `lease-${String(i + 1).padStart(3, '0')}`,
    renterId: `renter-${String((i % 15) + 1).padStart(3, '0')}`,
    renterName: ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛'][i % 15],
    renterPhone: `13${String(800000000 + (i % 15) * 13579).slice(0, 9)}`,
    unitId: `unit-floor-building-project-${String((i % 3) + 1).padStart(3, '0')}-${(i % 3) + 1}-${Math.floor(i / 3) + 1}-${(i % 4) + 1}`,
    unitNumber: `${Math.floor(i / 3) + 1}${String((i % 4) + 1).padStart(2, '0')}`,
    buildingName: `${(i % 3) + 1}号楼`,
    projectId: `project-${String((i % 3) + 1).padStart(3, '0')}`,
    projectName: `示例项目${(i % 3) + 1}`,
    checkInDate: new Date(2024, i % 12, 1 + (i % 28)).toISOString().split('T')[0],
    checkOutDate: isActive ? undefined : new Date(2025, (i % 6) + 1, 15).toISOString().split('T')[0],
    status: isActive ? 'ACTIVE' : 'CHECKED_OUT',
    contractId: i % 3 === 0 ? `contract-${String(i + 1).padStart(3, '0')}` : undefined,
    coResidents: i % 4 === 0
      ? [{ name: `家属${i + 1}`, phone: `15${String(100000000 + i * 11111).slice(0, 9)}`, relation: '配偶' }]
      : [],
    remark: i % 5 === 0 ? '正常入住' : undefined,
    createdAt: new Date(2024, i % 12, 1 + (i % 28)).toISOString(),
    updatedAt: new Date(2025, 3, 1 + i).toISOString(),
  };
});

export const leaseHandlers = [
  // GET /api/leases/my — 租户端：我的入住记录
  http.get('/api/leases/my', () => {
    const myLeases = leases.filter((l) => l.renterId === 'renter-tc-01');
    return HttpResponse.json(myLeases.length ? myLeases : [leases[0]]);
  }),

  http.get('/api/leases', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const projectId = url.searchParams.get('projectId');

    let filtered = [...leases];
    if (keyword) {
      filtered = filtered.filter(
        (l) => l.renterName.includes(keyword) || l.renterPhone?.includes(keyword) || l.unitNumber.includes(keyword),
      );
    }
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (projectId) filtered = filtered.filter((l) => l.projectId === projectId);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/leases/:id', ({ params }) => {
    const lease = leases.find((l) => l.id === params.id);
    if (!lease) {
      return HttpResponse.json({ code: 404, message: '记录不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(lease);
  }),

  http.post('/api/leases/check-in', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newLease = {
      id: `lease-${String(leases.length + 1).padStart(3, '0')}`,
      renterId: body.renterId as string,
      renterName: '新租户',
      renterPhone: '',
      unitId: body.unitId as string,
      unitNumber: '新单元',
      buildingName: '',
      projectId: '',
      projectName: '',
      checkInDate: body.checkInDate as string,
      checkOutDate: undefined,
      status: 'ACTIVE',
      contractId: body.contractId as string | undefined,
      coResidents: (body.coResidents as [] | undefined) ?? [],
      remark: body.remark as string | undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leases.push(newLease as typeof leases[0]);
    return HttpResponse.json(newLease, { status: 201 });
  }),

  http.post('/api/leases/:id/check-out', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = leases.findIndex((l) => l.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '记录不存在', data: null }, { status: 404 });
    }
    leases[idx] = {
      ...leases[idx],
      status: 'CHECKED_OUT',
      checkOutDate: body.checkOutDate as string,
      remark: body.remark as string | undefined ?? leases[idx].remark,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(leases[idx]);
  }),
];
