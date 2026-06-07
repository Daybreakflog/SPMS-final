import { http, HttpResponse } from 'msw';

const users = Array.from({ length: 30 }, (_, i) => {
  const roleGroups: string[][] = [
    ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
    ['COMPANY_ADMIN'],
    ['PROJECT_ADMIN'],
    ['FINANCE'],
    ['CUSTOMER_SERVICE'],
    ['ENGINEER'],
    ['OPERATIONS'],
  ];
  return {
    id: `user-${String(i + 1).padStart(3, '0')}`,
    username: ['admin', 'zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'sunqi', 'zhouba', 'wujiu', 'zhengshi'][i % 9] + (i >= 9 ? String(Math.floor(i / 9) + 1) : ''),
    realName: ['系统管理员', '张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][i % 9],
    phone: `13${String(700000000 + i * 11111).slice(0, 9)}`,
    email: `user${i + 1}@property.com`,
    department: ['管理层', '财务部', '客服部', '工程部', '运营部'][i % 5],
    roles: roleGroups[i % 7],
    companyId: 'company-001',
    companyName: '示例物业管理有限公司',
    projectIds: [`project-${String((i % 3) + 1).padStart(3, '0')}`],
    userType: 'STAFF' as const,
    status: i % 12 === 0 ? 'DISABLED' : 'ACTIVE',
    lastLoginAt: new Date(2025, 4, 20 - (i % 10)).toISOString(),
    createdAt: new Date(2024, 1, 1 + i * 4).toISOString(),
    updatedAt: new Date(2025, 3, 1 + i * 2).toISOString(),
  };
});

export const userHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const roles = url.searchParams.get('roles');
    const projectId = url.searchParams.get('projectId');

    let filtered = [...users];
    if (keyword) {
      filtered = filtered.filter((u) => u.username.includes(keyword) || u.realName.includes(keyword));
    }
    if (status) filtered = filtered.filter((u) => u.status === status);
    if (roles) {
      const roleList = roles.split(',');
      filtered = filtered.filter((u) => u.roles.some((r) => roleList.includes(r)));
    }
    if (projectId) {
      filtered = filtered.filter((u) => u.projectIds.includes(projectId));
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = users.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ code: 404, message: '用户不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newUser = {
      id: `user-${String(users.length + 1).padStart(3, '0')}`,
      ...body,
      companyId: 'company-001',
      companyName: '示例物业管理有限公司',
      projectIds: (body.projectIds as string[]) ?? [],
      userType: 'STAFF',
      status: 'ACTIVE',
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users.push(newUser as any);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '用户不存在', data: null }, { status: 404 });
    }
    users[idx] = { ...users[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(users[idx]);
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const idx = users.findIndex((u) => u.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '用户不存在', data: null }, { status: 404 });
    }
    users.splice(idx, 1);
    return HttpResponse.json(null, { status: 200 });
  }),

  http.put('/api/users/:id/roles', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.put('/api/users/:id/projects', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.put('/api/projects/assign-user-projects', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.post('/api/users/change-password', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),
];
