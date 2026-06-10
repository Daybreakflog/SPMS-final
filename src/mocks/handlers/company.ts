import { http, HttpResponse } from 'msw';

// RBAC 测试公司（固定 ID，与 auth.ts / user.ts / project.ts 保持一致）
const TEST_COMPANIES = [
  {
    id: 'company-101',
    name: '星辰物业集团有限公司',
    code: 'XC-001',
    contact: '陈总',
    phone: '010-88880001',
    address: '北京市朝阳区星辰大厦18层',
    status: 1,
    _count: { projects: 2, users: 7 },
    createdAt: new Date(2023, 5, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'company-102',
    name: '绿洲物业管理有限公司',
    code: 'LZ-001',
    contact: '吴总',
    phone: '021-66660001',
    address: '上海市徐汇区绿洲广场5层',
    status: 1,
    _count: { projects: 2, users: 4 },
    createdAt: new Date(2023, 8, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'company-103',
    name: '阳光家园物业服务有限公司',
    code: 'YG-001',
    contact: '林总',
    phone: '020-55550001',
    address: '广州市番禺区阳光商务中心3层',
    status: 1,
    _count: { projects: 1, users: 1 },
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
];

const companies = [
  ...TEST_COMPANIES,
  ...Array.from({ length: 35 }, (_, i) => ({
    id: `company-${String(i + 1).padStart(3, '0')}`,
    name: `${['鑫海', '万达', '恒大', '碧桂园', '融创', '绿地', '龙湖'][i % 7]}物业管理有限公司`,
    code: `PM${String(i + 1).padStart(4, '0')}`,
    contact: ['张经理', '李总', '王主任', '赵经理', '孙总'][i % 5],
    phone: `138${String(10000000 + i * 1234).slice(0, 8)}`,
    address: `北京市朝阳区${['建国路', '望京街', '三里屯路', '国贸大道'][i % 4]}${i + 1}号`,
    status: i % 8 === 0 ? 0 : 1,
    _count: { projects: Math.floor(Math.random() * 10) + 1, users: Math.floor(Math.random() * 50) + 5 },
    createdAt: new Date(2024, 0, 1 + i * 3).toISOString(),
    updatedAt: new Date(2025, 0, 1 + i * 2).toISOString(),
  })),
];

export const companyHandlers = [
  http.get('/api/platform/companies', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');

    let filtered = [...companies];
    if (name) filtered = filtered.filter((c) => c.name.includes(name));
    if (status) filtered = filtered.filter((c) => c.status === Number(status));

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }),

  http.get('/api/platform/companies/:id', ({ params }) => {
    const company = companies.find((c) => c.id === params.id);
    if (!company) {
      return HttpResponse.json({ code: 404, message: '公司不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(company);
  }),

  http.post('/api/platform/companies', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newCompany = {
      id: `company-${String(companies.length + 1).padStart(3, '0')}`,
      ...body,
      status: 1,
      _count: { projects: 0, users: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    companies.push(newCompany as typeof companies[0]);
    return HttpResponse.json(newCompany, { status: 201 });
  }),

  http.patch('/api/platform/companies/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idx = companies.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '公司不存在', data: null }, { status: 404 });
    }
    companies[idx] = { ...companies[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(companies[idx]);
  }),

  http.delete('/api/platform/companies/:id', ({ params }) => {
    const idx = companies.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '公司不存在', data: null }, { status: 404 });
    }
    companies.splice(idx, 1);
    return HttpResponse.json(null, { status: 200 });
  }),
];
