import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/auth/staff/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        accessToken: 'mock-access-token-admin',
        refreshToken: 'mock-refresh-token-admin',
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
      });
    }

    return HttpResponse.json(
      { code: 401, message: '用户名或密码错误', data: null },
      { status: 401 },
    );
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.get('/api/dashboard/overview', () => {
    return HttpResponse.json({
      occupancyRate: 85.6,
      monthlyReceivable: 523800,
      monthlyCollected: 412500,
      collectionRate: 78.7,
      pendingRepairs: 12,
      overdueBillsCount: 8,
      expiringContractsCount: 3,
    });
  }),
];
