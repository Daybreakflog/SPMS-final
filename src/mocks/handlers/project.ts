import { http, HttpResponse } from 'msw';

const projects = Array.from({ length: 20 }, (_, i) => ({
  id: `project-${String(i + 1).padStart(3, '0')}`,
  name: `${['翠湖花园', '阳光城', '万科城', '碧桂园', '恒大名都'][i % 5]}${i > 4 ? ` ${Math.floor(i / 5) + 1}期` : ''}`,
  companyId: `company-${String((i % 5) + 1).padStart(3, '0')}`,
  companyName: `${['鑫海', '万达', '恒大', '碧桂园', '融创'][i % 5]}物业管理有限公司`,
  address: `上海市浦东新区${['张江路', '金科路', '碧波路', '龙东大道'][i % 4]}${100 + i}号`,
  manager: ['王建华', '李明', '张伟', '陈浩', '刘洋'][i % 5],
  contactPhone: `139${String(20000000 + i * 2345).slice(0, 8)}`,
  areaUnit: '㎡',
  billingStartDate: '2024-01-01',
  remark: '',
  status: i % 10 === 0 ? 'DISABLED' : 'ACTIVE',
  buildingCount: Math.floor(Math.random() * 8) + 1,
  unitCount: Math.floor(Math.random() * 200) + 50,
  occupancyRate: Math.round((70 + Math.random() * 25) * 10) / 10,
  createdAt: new Date(2024, 0, 10 + i * 5).toISOString(),
  updatedAt: new Date(2025, 1, 1 + i * 3).toISOString(),
}));

const projectUsers: Record<string, Array<{ id: string; username: string; realName: string; phone: string; roles: string[] }>> = {
  'project-001': [
    { id: 'user-001', username: 'admin', realName: '系统管理员', phone: '13800000001', roles: ['PLATFORM_ADMIN'] },
    { id: 'user-002', username: 'zhangsan', realName: '张三', phone: '13800000002', roles: ['PROJECT_ADMIN'] },
  ],
  'project-002': [
    { id: 'user-003', username: 'lisi', realName: '李四', phone: '13800000003', roles: ['FINANCE'] },
  ],
};

export const projectHandlers = [
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const name = url.searchParams.get('name');
    const companyId = url.searchParams.get('companyId');
    const status = url.searchParams.get('status');

    let filtered = [...projects];
    if (name) filtered = filtered.filter((p) => p.name.includes(name));
    if (companyId) filtered = filtered.filter((p) => p.companyId === companyId);
    if (status) filtered = filtered.filter((p) => p.status === status);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ code: 404, message: '项目不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.post('/api/projects', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newProject = {
      id: `project-${String(projects.length + 1).padStart(3, '0')}`,
      ...body,
      companyName: '示例物业管理有限公司',
      status: 'ACTIVE',
      buildingCount: 0,
      unitCount: 0,
      occupancyRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject as typeof projects[0]);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.patch('/api/projects/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idx = projects.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '项目不存在', data: null }, { status: 404 });
    }
    projects[idx] = { ...projects[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(projects[idx]);
  }),

  http.delete('/api/projects/:id', ({ params }) => {
    const idx = projects.findIndex((p) => p.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '项目不存在', data: null }, { status: 404 });
    }
    projects.splice(idx, 1);
    return HttpResponse.json(null, { status: 200 });
  }),

  http.get('/api/projects/:id/users', ({ params }) => {
    const users = projectUsers[params.id as string] ?? [];
    return HttpResponse.json(users);
  }),

  http.put('/api/projects/:id/users', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),
];
