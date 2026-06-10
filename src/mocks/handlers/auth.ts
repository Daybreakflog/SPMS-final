import { http, HttpResponse } from 'msw';

// 测试账号表（密码统一：Test@2024）
// 角色说明：
//   PLATFORM_ADMIN   → 跨公司全数据可见
//   COMPANY_ADMIN    → 仅本公司数据
//   PROJECT_ADMIN    → 仅分配的项目数据
//   FINANCE          → 账单/收款/报表
//   CUSTOMER_SERVICE → 租户/合同/报修/投诉
//   ENGINEER         → 维修工单
//   OPERATIONS       → 数据概览/报表（只读）
const TEST_ACCOUNTS: Record<string, { password: string; user: object }> = {
  platform_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-01',
      username: 'platform_admin',
      realName: '陈明（平台超管）',
      phone: '13900010001',
      roles: ['PLATFORM_ADMIN'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101', 'project-102', 'project-103', 'project-104', 'project-105'],
      userType: 'STAFF',
    },
  },
  xc_company_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-02',
      username: 'xc_company_admin',
      realName: '张建华（公司管理员）',
      phone: '13900010002',
      roles: ['COMPANY_ADMIN'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101', 'project-102'],
      userType: 'STAFF',
    },
  },
  th_project_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-03',
      username: 'th_project_admin',
      realName: '刘建国（项目管理员）',
      phone: '13900010003',
      roles: ['PROJECT_ADMIN'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101'],
      userType: 'STAFF',
    },
  },
  th_finance: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-04',
      username: 'th_finance',
      realName: '王芳（财务专员）',
      phone: '13900010004',
      roles: ['FINANCE'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101'],
      userType: 'STAFF',
    },
  },
  th_service: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-05',
      username: 'th_service',
      realName: '李梅（客服专员）',
      phone: '13900010005',
      roles: ['CUSTOMER_SERVICE'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101'],
      userType: 'STAFF',
    },
  },
  th_engineer: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-06',
      username: 'th_engineer',
      realName: '赵强（维修工程师）',
      phone: '13900010006',
      roles: ['ENGINEER'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101'],
      userType: 'STAFF',
    },
  },
  th_ops: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-07',
      username: 'th_ops',
      realName: '孙磊（运营专员）',
      phone: '13900010007',
      roles: ['OPERATIONS'],
      companyId: 'company-101',
      companyName: '星辰物业集团有限公司',
      projectIds: ['project-101', 'project-102'],
      userType: 'STAFF',
    },
  },
  lz_company_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-08',
      username: 'lz_company_admin',
      realName: '吴志远（公司管理员）',
      phone: '13900010008',
      roles: ['COMPANY_ADMIN'],
      companyId: 'company-102',
      companyName: '绿洲物业管理有限公司',
      projectIds: ['project-103', 'project-104'],
      userType: 'STAFF',
    },
  },
  fc_project_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-09',
      username: 'fc_project_admin',
      realName: '郑建国（项目管理员）',
      phone: '13900010009',
      roles: ['PROJECT_ADMIN'],
      companyId: 'company-102',
      companyName: '绿洲物业管理有限公司',
      projectIds: ['project-103'],
      userType: 'STAFF',
    },
  },
  fc_finance: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-10',
      username: 'fc_finance',
      realName: '周敏（财务专员）',
      phone: '13900010010',
      roles: ['FINANCE'],
      companyId: 'company-102',
      companyName: '绿洲物业管理有限公司',
      projectIds: ['project-103', 'project-104'],
      userType: 'STAFF',
    },
  },
  sd_service: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-11',
      username: 'sd_service',
      realName: '黄丽（客服专员）',
      phone: '13900010011',
      roles: ['CUSTOMER_SERVICE'],
      companyId: 'company-102',
      companyName: '绿洲物业管理有限公司',
      projectIds: ['project-104'],
      userType: 'STAFF',
    },
  },
  yg_project_admin: {
    password: 'Test@2024',
    user: {
      id: 'user-tc-12',
      username: 'yg_project_admin',
      realName: '林静（项目管理员）',
      phone: '13900010012',
      roles: ['PROJECT_ADMIN'],
      companyId: 'company-103',
      companyName: '阳光家园物业服务有限公司',
      projectIds: ['project-105'],
      userType: 'STAFF',
    },
  },
  disabled_finance: {
    password: 'Test@2024',
    user: null as unknown as object, // 已禁用，登录返回 401
  },
  // 原始 admin 账号保留
  admin: {
    password: 'admin123',
    user: {
      id: 'user-001',
      username: 'admin',
      realName: '系统管理员',
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
      companyId: 'company-001',
      companyName: '示例物业管理有限公司',
      projectIds: ['project-001', 'project-002'],
      userType: 'STAFF',
    },
  },
};

// 测试租户账号（密码：Tenant@2024）
const TEST_TENANT_ACCOUNTS: Record<string, { password: string; user: object }> = {
  tenant_zhangwei: {
    password: 'Tenant@2024',
    user: { id: 'account-tc-01', username: 'tenant_zhangwei', renterId: 'renter-tc-01', renterName: '张伟', phone: '13901000101', userType: 'TENANT' },
  },
  tenant_lina: {
    password: 'Tenant@2024',
    user: { id: 'account-tc-02', username: 'tenant_lina', renterId: 'renter-tc-02', renterName: '李娜', phone: '13901000102', userType: 'TENANT' },
  },
  tenant_chenjing: {
    password: 'Tenant@2024',
    user: { id: 'account-tc-03', username: 'tenant_chenjing', renterId: 'renter-tc-05', renterName: '陈静', phone: '13901000105', userType: 'TENANT' },
  },
  tenant_boyuan: {
    password: 'Tenant@2024',
    user: { id: 'account-tc-04', username: 'tenant_boyuan', renterId: 'renter-tc-06', renterName: '博远科技有限公司', phone: '13901000106', userType: 'TENANT' },
  },
  tenant_zhouxin: {
    password: 'Tenant@2024',
    user: { id: 'account-tc-05', username: 'tenant_zhouxin', renterId: 'renter-tc-09', renterName: '周鑫', phone: '13901000109', userType: 'TENANT' },
  },
};

export const authHandlers = [
  http.post('/api/auth/staff/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const account = TEST_ACCOUNTS[body.username];

    if (!account || account.password !== body.password) {
      return HttpResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 },
      );
    }

    if (!account.user) {
      return HttpResponse.json(
        { code: 401, message: '账号已被禁用', data: null },
        { status: 401 },
      );
    }

    const tokenSuffix = body.username.replace(/_/g, '-');
    return HttpResponse.json({
      accessToken:  `mock-access-token-${tokenSuffix}`,
      refreshToken: `mock-refresh-token-${tokenSuffix}`,
      user: account.user,
    });
  }),

  http.post('/api/auth/tenant/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const account = TEST_TENANT_ACCOUNTS[body.username];

    if (!account || account.password !== body.password) {
      return HttpResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 },
      );
    }

    const tokenSuffix = body.username.replace(/_/g, '-');
    return HttpResponse.json({
      accessToken:  `mock-access-token-${tokenSuffix}`,
      refreshToken: `mock-refresh-token-${tokenSuffix}`,
      user: account.user,
    });
  }),

  http.post('/api/auth/tenant/register', async ({ request }) => {
    const body = await request.json() as { username: string; password: string; phone?: string; renterProfileId?: string };
    const tokenSuffix = body.username.replace(/_/g, '-');
    return HttpResponse.json({
      accessToken:  `mock-access-token-${tokenSuffix}`,
      refreshToken: `mock-refresh-token-${tokenSuffix}`,
      user: {
        id: `account-new-${Date.now()}`,
        username: body.username,
        renterId: body.renterProfileId ?? null,
        renterName: null,
        phone: body.phone ?? null,
        userType: 'TENANT',
      },
    }, { status: 201 });
  }),

  http.post('/api/auth/wx-login', async ({ request }) => {
    const body = await request.json() as { code: string; clientType?: string };
    const tokenSuffix = `wx-${body.code.slice(0, 8)}`;
    return HttpResponse.json({
      accessToken:  `mock-access-token-${tokenSuffix}`,
      refreshToken: `mock-refresh-token-${tokenSuffix}`,
      user: {
        id: 'account-wx-001',
        username: 'wx_user',
        renterId: null,
        renterName: null,
        openid: body.code,
        userType: 'TENANT',
      },
    });
  }),

  http.post('/api/auth/tenant/bind-renter', async ({ request }) => {
    await request.json();
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      accessToken:  'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(null, { status: 200 });
  }),
];
