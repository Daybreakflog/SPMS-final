import { http, HttpResponse } from 'msw';

// ⚠ MSW DRIFT MARKER
//   GET /api/system/audit-logs/resource-history 在 Swagger 1.0 中未定义，
//   仅本地审计 UI 使用。后端需要补齐或前端改走通用 /api/system/audit-logs 过滤。

const modules = ['USER', 'CONTRACT', 'BILLING', 'REPAIR', 'ANNOUNCEMENT', 'SYSTEM'];
const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'LOGIN'];
const operators = ['张管理', '李财务', '王客服', '赵工程', '钱运营', '孙管理'];

const auditLogs = Array.from({ length: 30 }, (_, i) => {
  const module = modules[i % modules.length];
  const action = actions[i % actions.length];
  const operator = operators[i % operators.length];
  const isSuccess = i % 7 !== 0;
  const date = new Date(2025, 11, 30 - i, 8 + (i % 12), i * 2, 0);

  let targetResource = '';
  let detail: string | undefined;

  switch (module) {
    case 'USER':
      targetResource = `用户:user-${100 + i}`;
      detail = action === 'UPDATE' ? '{"old":{"phone":"13800000001"},"new":{"phone":"13800000002"}}' : undefined;
      break;
    case 'CONTRACT':
      targetResource = `合同:CT-2025-${String(i + 1).padStart(3, '0')}`;
      detail = action === 'APPROVE' ? '{"old":{"status":"PENDING_FINANCE"},"new":{"status":"PENDING_ADMIN"}}' : undefined;
      break;
    case 'BILLING':
      targetResource = `账单:BILL-2025-${String(i + 1).padStart(3, '0')}`;
      detail = action === 'CREATE' ? '{"new":{"amount":5600,"feeItem":"物业费","renter":"张三"}}' : undefined;
      break;
    case 'REPAIR':
      targetResource = `工单:WO-2025-${String(i + 1).padStart(3, '0')}`;
      detail = action === 'UPDATE' ? '{"old":{"status":"SUBMITTED"},"new":{"status":"ASSIGNED"}}' : undefined;
      break;
    case 'ANNOUNCEMENT':
      targetResource = `公告:ANN-${String(i + 1).padStart(3, '0')}`;
      detail = action === 'UPDATE' ? '{"old":{"status":"DRAFT"},"new":{"status":"PUBLISHED"}}' : undefined;
      break;
    case 'SYSTEM':
      targetResource = `系统配置:config-${i + 1}`;
      detail = action === 'LOGIN' ? `{"ip":"192.168.1.${100 + i}","userAgent":"Chrome/120"}` : undefined;
      break;
  }

  return {
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    operatorId: `user-${(i % 6) + 1}`,
    operatorName: operator,
    module,
    action,
    targetResource,
    ipAddress: `192.168.1.${100 + (i % 50)}`,
    result: isSuccess ? 'SUCCESS' : 'FAILURE',
    detail,
    createdAt: date.toISOString(),
  };
});

export const auditHandlers = [
  http.get('/api/system/audit-logs/resource-history', ({ request }) => {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId') ?? '';
    const history = auditLogs
      .filter((l) => l.targetResource.includes(resourceId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return HttpResponse.json(history);
  }),

  http.get('/api/system/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const module = url.searchParams.get('module');
    const action = url.searchParams.get('action');
    const result = url.searchParams.get('result');
    const operatorName = url.searchParams.get('operatorName');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let filtered = [...auditLogs];

    if (module) {
      filtered = filtered.filter((l) => l.module === module);
    }
    if (action) {
      filtered = filtered.filter((l) => l.action === action);
    }
    if (result) {
      filtered = filtered.filter((l) => l.result === result);
    }
    if (operatorName) {
      filtered = filtered.filter((l) => l.operatorName.includes(operatorName));
    }
    if (startDate) {
      filtered = filtered.filter((l) => l.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((l) => l.createdAt <= endDate);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }),
];
