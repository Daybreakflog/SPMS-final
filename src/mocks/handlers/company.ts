import { http, HttpResponse } from 'msw';

const companies = Array.from({ length: 35 }, (_, i) => ({
  id: `company-${String(i + 1).padStart(3, '0')}`,
  name: `${['鑫海', '万达', '恒大', '碧桂园', '融创', '绿地', '龙湖'][i % 7]}物业管理有限公司`,
  creditCode: `91110000${String(100000000 + i * 13579)}`,
  contactPerson: ['张经理', '李总', '王主任', '赵经理', '孙总'][i % 5],
  contactPhone: `138${String(10000000 + i * 1234).slice(0, 8)}`,
  email: `contact${i + 1}@property.com`,
  address: `北京市朝阳区${['建国路', '望京街', '三里屯路', '国贸大道'][i % 4]}${i + 1}号`,
  status: i % 8 === 0 ? 'DISABLED' : 'ACTIVE',
  projectCount: Math.floor(Math.random() * 10) + 1,
  staffCount: Math.floor(Math.random() * 50) + 5,
  createdAt: new Date(2024, 0, 1 + i * 3).toISOString(),
  updatedAt: new Date(2025, 0, 1 + i * 2).toISOString(),
}));

export const companyHandlers = [
  http.get('/api/platform/companies', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');

    let filtered = [...companies];
    if (name) filtered = filtered.filter((c) => c.name.includes(name));
    if (status) filtered = filtered.filter((c) => c.status === status);

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
      status: 'ACTIVE',
      projectCount: 0,
      staffCount: 0,
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
