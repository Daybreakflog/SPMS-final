import { http, HttpResponse } from 'msw';

// RBAC 测试项目（固定 ID，与 auth.ts / user.ts 保持一致）
const TEST_PROJECTS = [
  {
    id: 'project-101',
    name: '星辰·天鹅湖花园',
    companyId: 'company-101',
    companyName: '星辰物业集团有限公司',
    address: '北京市海淀区天鹅湖路88号',
    manager: '刘建国',
    contactPhone: '13900010003',
    areaUnit: '㎡',
    billingStartDate: '2024-01-01',
    remark: '高档住宅小区，共12栋约1200户',
    status: 'ACTIVE',
    buildingCount: 2,
    unitCount: 20,
    occupancyRate: 82.5,
    createdAt: new Date(2023, 5, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'project-102',
    name: '星辰·御景豪庭',
    companyId: 'company-101',
    companyName: '星辰物业集团有限公司',
    address: '北京市朝阳区御景大道168号',
    manager: '张建华',
    contactPhone: '13900010002',
    areaUnit: '㎡',
    billingStartDate: '2024-01-01',
    remark: '豪华公寓，共8栋约600户',
    status: 'ACTIVE',
    buildingCount: 1,
    unitCount: 8,
    occupancyRate: 91.2,
    createdAt: new Date(2023, 8, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'project-103',
    name: '绿洲·翡翠城',
    companyId: 'company-102',
    companyName: '绿洲物业管理有限公司',
    address: '上海市徐汇区翡翠路55号',
    manager: '郑建国',
    contactPhone: '13900010009',
    areaUnit: '㎡',
    billingStartDate: '2024-01-01',
    remark: '生态住宅社区，共10栋约900户',
    status: 'ACTIVE',
    buildingCount: 2,
    unitCount: 16,
    occupancyRate: 76.8,
    createdAt: new Date(2023, 10, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'project-104',
    name: '绿洲·水岸名都',
    companyId: 'company-102',
    companyName: '绿洲物业管理有限公司',
    address: '上海市闵行区水岸路200号',
    manager: '吴志远',
    contactPhone: '13900010008',
    areaUnit: '㎡',
    billingStartDate: '2024-06-01',
    remark: '滨水住宅区，共6栋约480户',
    status: 'ACTIVE',
    buildingCount: 1,
    unitCount: 8,
    occupancyRate: 68.4,
    createdAt: new Date(2024, 0, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
  {
    id: 'project-105',
    name: '阳光·幸福里',
    companyId: 'company-103',
    companyName: '阳光家园物业服务有限公司',
    address: '广州市番禺区幸福街12号',
    manager: '林静',
    contactPhone: '13900010012',
    areaUnit: '㎡',
    billingStartDate: '2025-01-01',
    remark: '经济适用住宅，共4栋约320户',
    status: 'ACTIVE',
    buildingCount: 1,
    unitCount: 8,
    occupancyRate: 55.0,
    createdAt: new Date(2024, 6, 1).toISOString(),
    updatedAt: new Date(2025, 0, 1).toISOString(),
  },
];

const projects = [
  ...TEST_PROJECTS,
  ...Array.from({ length: 20 }, (_, i) => ({
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
  })),
];

const projectUsers: Record<string, Array<{ id: string; username: string; realName: string; phone: string; roles: string[] }>> = {
  // RBAC 测试项目的人员配置
  'project-101': [
    { id: 'user-tc-01', username: 'platform_admin',   realName: '陈明',   phone: '13900010001', roles: ['PLATFORM_ADMIN'] },
    { id: 'user-tc-02', username: 'xc_company_admin', realName: '张建华', phone: '13900010002', roles: ['COMPANY_ADMIN'] },
    { id: 'user-tc-03', username: 'th_project_admin', realName: '刘建国', phone: '13900010003', roles: ['PROJECT_ADMIN'] },
    { id: 'user-tc-04', username: 'th_finance',       realName: '王芳',   phone: '13900010004', roles: ['FINANCE'] },
    { id: 'user-tc-05', username: 'th_service',       realName: '李梅',   phone: '13900010005', roles: ['CUSTOMER_SERVICE'] },
    { id: 'user-tc-06', username: 'th_engineer',      realName: '赵强',   phone: '13900010006', roles: ['ENGINEER'] },
    { id: 'user-tc-07', username: 'th_ops',           realName: '孙磊',   phone: '13900010007', roles: ['OPERATIONS'] },
  ],
  'project-102': [
    { id: 'user-tc-02', username: 'xc_company_admin', realName: '张建华', phone: '13900010002', roles: ['COMPANY_ADMIN'] },
    { id: 'user-tc-07', username: 'th_ops',           realName: '孙磊',   phone: '13900010007', roles: ['OPERATIONS'] },
  ],
  'project-103': [
    { id: 'user-tc-08', username: 'lz_company_admin', realName: '吴志远', phone: '13900010008', roles: ['COMPANY_ADMIN'] },
    { id: 'user-tc-09', username: 'fc_project_admin', realName: '郑建国', phone: '13900010009', roles: ['PROJECT_ADMIN'] },
    { id: 'user-tc-10', username: 'fc_finance',       realName: '周敏',   phone: '13900010010', roles: ['FINANCE'] },
  ],
  'project-104': [
    { id: 'user-tc-08', username: 'lz_company_admin', realName: '吴志远', phone: '13900010008', roles: ['COMPANY_ADMIN'] },
    { id: 'user-tc-10', username: 'fc_finance',       realName: '周敏',   phone: '13900010010', roles: ['FINANCE'] },
    { id: 'user-tc-11', username: 'sd_service',       realName: '黄丽',   phone: '13900010011', roles: ['CUSTOMER_SERVICE'] },
  ],
  'project-105': [
    { id: 'user-tc-12', username: 'yg_project_admin', realName: '林静',   phone: '13900010012', roles: ['PROJECT_ADMIN'] },
  ],
  // 原有示例数据
  'project-001': [
    { id: 'user-001', username: 'admin',    realName: '系统管理员', phone: '13800000001', roles: ['PLATFORM_ADMIN'] },
    { id: 'user-002', username: 'zhangsan', realName: '张三',       phone: '13800000002', roles: ['PROJECT_ADMIN'] },
  ],
  'project-002': [
    { id: 'user-003', username: 'lisi', realName: '李四', phone: '13800000003', roles: ['FINANCE'] },
  ],
};

export const projectHandlers = [
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
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
