import { http, HttpResponse } from 'msw';

// RBAC 测试员工（固定账号，密码均为 Test@2024）
const TEST_USERS = [
  { id: 'user-tc-01', username: 'platform_admin',   realName: '陈明',           phone: '13900010001', roles: ['PLATFORM_ADMIN'],    companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101','project-102','project-103','project-104','project-105'], userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 1).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 1).toISOString() },
  { id: 'user-tc-02', username: 'xc_company_admin', realName: '张建华',         phone: '13900010002', roles: ['COMPANY_ADMIN'],     companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101','project-102'],       userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 2).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 2).toISOString() },
  { id: 'user-tc-03', username: 'th_project_admin', realName: '刘建国',         phone: '13900010003', roles: ['PROJECT_ADMIN'],     companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 3).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 3).toISOString() },
  { id: 'user-tc-04', username: 'th_finance',       realName: '王芳',           phone: '13900010004', roles: ['FINANCE'],           companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 4).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 4).toISOString() },
  { id: 'user-tc-05', username: 'th_service',       realName: '李梅',           phone: '13900010005', roles: ['CUSTOMER_SERVICE'],  companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 5).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 5).toISOString() },
  { id: 'user-tc-06', username: 'th_engineer',      realName: '赵强',           phone: '13900010006', roles: ['ENGINEER'],          companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 6).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 6).toISOString() },
  { id: 'user-tc-07', username: 'th_ops',           realName: '孙磊',           phone: '13900010007', roles: ['OPERATIONS'],        companyId: 'company-101', companyName: '星辰物业集团有限公司',     projectIds: ['project-101','project-102'],       userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 7).toISOString(),  createdAt: new Date(2023, 5, 1).toISOString(),  updatedAt: new Date(2026, 5, 7).toISOString() },
  { id: 'user-tc-08', username: 'lz_company_admin', realName: '吴志远',         phone: '13900010008', roles: ['COMPANY_ADMIN'],     companyId: 'company-102', companyName: '绿洲物业管理有限公司',     projectIds: ['project-103','project-104'],       userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 8).toISOString(),  createdAt: new Date(2023, 8, 1).toISOString(),  updatedAt: new Date(2026, 5, 8).toISOString() },
  { id: 'user-tc-09', username: 'fc_project_admin', realName: '郑建国',         phone: '13900010009', roles: ['PROJECT_ADMIN'],     companyId: 'company-102', companyName: '绿洲物业管理有限公司',     projectIds: ['project-103'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 9).toISOString(),  createdAt: new Date(2023, 8, 1).toISOString(),  updatedAt: new Date(2026, 5, 9).toISOString() },
  { id: 'user-tc-10', username: 'fc_finance',       realName: '周敏',           phone: '13900010010', roles: ['FINANCE'],           companyId: 'company-102', companyName: '绿洲物业管理有限公司',     projectIds: ['project-103','project-104'],       userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 10).toISOString(), createdAt: new Date(2023, 8, 1).toISOString(),  updatedAt: new Date(2026, 5, 10).toISOString() },
  { id: 'user-tc-11', username: 'sd_service',       realName: '黄丽',           phone: '13900010011', roles: ['CUSTOMER_SERVICE'],  companyId: 'company-102', companyName: '绿洲物业管理有限公司',     projectIds: ['project-104'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 11).toISOString(), createdAt: new Date(2023, 8, 1).toISOString(),  updatedAt: new Date(2026, 5, 11).toISOString() },
  { id: 'user-tc-12', username: 'yg_project_admin', realName: '林静',           phone: '13900010012', roles: ['PROJECT_ADMIN'],     companyId: 'company-103', companyName: '阳光家园物业服务有限公司', projectIds: ['project-105'],                     userType: 'STAFF' as const, status: 1,   lastLoginAt: new Date(2026, 5, 12).toISOString(), createdAt: new Date(2024, 0, 1).toISOString(),  updatedAt: new Date(2026, 5, 12).toISOString() },
  { id: 'user-tc-13', username: 'disabled_finance', realName: '马明（已禁用）', phone: '13900010013', roles: ['FINANCE'],           companyId: 'company-102', companyName: '绿洲物业管理有限公司',     projectIds: ['project-103'],                     userType: 'STAFF' as const, status: 0, lastLoginAt: null,                                createdAt: new Date(2024, 0, 1).toISOString(),  updatedAt: new Date(2025, 0, 1).toISOString() },
];

const users = [
  ...TEST_USERS,
  ...Array.from({ length: 30 }, (_, i) => {
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
    department: ['管理层', '财务部', '客服部', '工程部', '运营部'][i % 5],
    roles: roleGroups[i % 7],
    companyId: 'company-001',
    companyName: '示例物业管理有限公司',
    projectIds: [`project-${String((i % 3) + 1).padStart(3, '0')}`],
    userType: 'STAFF' as const,
    status: i % 12 === 0 ? 0 : 1,
    lastLoginAt: new Date(2025, 4, 20 - (i % 10)).toISOString(),
    createdAt: new Date(2024, 1, 1 + i * 4).toISOString(),
    updatedAt: new Date(2025, 3, 1 + i * 2).toISOString(),
  };
  }),
];

export const userHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const roles = url.searchParams.get('roles');
    const projectId = url.searchParams.get('projectId');
    const companyId = url.searchParams.get('companyId');

    let filtered = [...users];
    if (keyword) {
      filtered = filtered.filter((u) => u.username.includes(keyword) || u.realName.includes(keyword));
    }
    if (status) filtered = filtered.filter((u) => u.status === Number(status));
    if (roles) {
      const roleList = roles.split(',');
      filtered = filtered.filter((u) => u.roles.some((r) => roleList.includes(r)));
    }
    if (projectId) {
      filtered = filtered.filter((u) => u.projectIds.includes(projectId));
    }
    if (companyId) {
      filtered = filtered.filter((u) => u.companyId === companyId);
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
      status: 1,
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
];
