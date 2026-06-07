import { http, HttpResponse } from 'msw';

const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '华', '雪', '慧'];

const renters = Array.from({ length: 25 }, (_, i) => {
  const surname = surnames[i % surnames.length];
  const given = givenNames[i % givenNames.length];
  const gender = i % 3 === 0 ? 'FEMALE' : 'MALE';
  const hasAccount = i % 3 !== 2;
  return {
    id: `renter-${String(i + 1).padStart(3, '0')}`,
    name: `${surname}${given}`,
    gender,
    birthDate: `${1975 + (i % 25)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    idType: 'ID_CARD',
    idNumber: `110101${1975 + (i % 25)}${String((i % 12) + 1).padStart(2, '0')}${String((i % 28) + 1).padStart(2, '0')}${String(1000 + i * 37).slice(0, 4)}`,
    phone: `13${String(800000000 + i * 13579).slice(0, 9)}`,
    phoneAlt: i % 4 === 0 ? `15${String(900000000 + i * 11111).slice(0, 9)}` : undefined,
    email: i % 3 === 0 ? `${surname.toLowerCase()}${given.toLowerCase()}@mail.com` : undefined,
    emergencyContact: i % 5 === 0 ? `${surnames[(i + 3) % surnames.length]}先生 139${String(i).padStart(8, '0')}` : undefined,
    company: i % 4 === 0 ? `${surname}氏科技有限公司` : undefined,
    position: i % 4 === 0 ? '经理' : undefined,
    attachments: [],
    remark: i % 6 === 0 ? '长期租户' : undefined,
    currentUnit: i < 15 ? `${String(Math.floor(i / 5) + 1)}栋${String(Math.floor(i / 3) + 1)}0${(i % 5) + 1}` : undefined,
    currentProjectId: i < 15 ? `project-${String((i % 3) + 1).padStart(3, '0')}` : undefined,
    currentProjectName: i < 15 ? `示例项目${(i % 3) + 1}` : undefined,
    accountStatus: hasAccount ? 'ACTIVE' : undefined,
    createdAt: new Date(2024, 2, 1 + i * 5).toISOString(),
    updatedAt: new Date(2025, 3, 1 + i * 2).toISOString(),
  };
});

const renterAccounts: Record<string, Array<{
  id: string;
  renterId: string;
  username: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}>> = {};

renters.forEach((r, i) => {
  if (r.accountStatus === 'ACTIVE') {
    renterAccounts[r.id] = [{
      id: `account-${String(i + 1).padStart(3, '0')}`,
      renterId: r.id,
      username: `tenant_${r.name}`,
      status: 'ACTIVE',
      lastLoginAt: new Date(2025, 4, 20 - (i % 10)).toISOString(),
      createdAt: new Date(2024, 3, 1 + i * 3).toISOString(),
    }];
  }
});

export const renterHandlers = [
  http.get('/api/renters', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword');
    const projectId = url.searchParams.get('projectId');
    const bindStatus = url.searchParams.get('bindStatus');

    let filtered = [...renters];
    if (keyword) {
      filtered = filtered.filter(
        (r) => r.name.includes(keyword) || r.phone.includes(keyword) || r.idNumber.includes(keyword),
      );
    }
    if (projectId) {
      filtered = filtered.filter((r) => r.currentProjectId === projectId);
    }
    if (bindStatus === 'BOUND') {
      filtered = filtered.filter((r) => !!r.currentUnit);
    } else if (bindStatus === 'UNBOUND') {
      filtered = filtered.filter((r) => !r.currentUnit);
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/renters/:id', ({ params }) => {
    const renter = renters.find((r) => r.id === params.id);
    if (!renter) {
      return HttpResponse.json({ code: 404, message: '租户不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(renter);
  }),

  http.post('/api/renters', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRenter = {
      id: `renter-${String(renters.length + 1).padStart(3, '0')}`,
      ...body,
      accountStatus: undefined,
      currentUnit: undefined,
      currentProjectId: undefined,
      currentProjectName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    renters.push(newRenter as typeof renters[0]);
    return HttpResponse.json(newRenter, { status: 201 });
  }),

  http.put('/api/renters/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = renters.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '租户不存在', data: null }, { status: 404 });
    }
    renters[idx] = { ...renters[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(renters[idx]);
  }),

  http.delete('/api/renters/:id', ({ params }) => {
    const idx = renters.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '租户不存在', data: null }, { status: 404 });
    }
    renters.splice(idx, 1);
    return HttpResponse.json(null, { status: 200 });
  }),

  http.get('/api/renters/:id/accounts', ({ params }) => {
    const accounts = renterAccounts[params.id as string] ?? [];
    return HttpResponse.json(accounts);
  }),

  http.post('/api/renters/:id/accounts', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const renterId = params.id as string;
    const account = {
      id: `account-${Date.now()}`,
      renterId,
      username: body.username as string,
      status: 'ACTIVE',
      lastLoginAt: undefined,
      createdAt: new Date().toISOString(),
    };
    if (!renterAccounts[renterId]) renterAccounts[renterId] = [];
    renterAccounts[renterId].push(account);
    const renter = renters.find((r) => r.id === renterId);
    if (renter) renter.accountStatus = 'ACTIVE';
    return HttpResponse.json(account, { status: 201 });
  }),

  http.patch('/api/renters/accounts/:accountId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    for (const accounts of Object.values(renterAccounts)) {
      const acc = accounts.find((a) => a.id === params.accountId);
      if (acc) {
        Object.assign(acc, body);
        return HttpResponse.json(acc);
      }
    }
    return HttpResponse.json({ code: 404, message: '账号不存在', data: null }, { status: 404 });
  }),

  http.post('/api/renters/accounts/:accountId/reset-password', async () => {
    return HttpResponse.json({ message: '密码重置成功' });
  }),
];
