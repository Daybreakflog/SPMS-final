import { http, HttpResponse } from 'msw';

export const dashboardHandlers = [
  // GET /api/dashboard/overview
  http.get('/api/dashboard/overview', () => {
    return HttpResponse.json({
      occupancyRate: 87.5,
      occupancyRateTrend: 1.2,
      monthlyReceivable: 285000,
      monthlyReceivableTrend: 3.5,
      monthlyCollected: 256500,
      monthlyCollectedTrend: -1.8,
      collectionRate: 90.0,
      collectionRateTrend: 2.1,
      pendingRepairs: 5,
      pendingRepairsTrend: -16.7,
      overdueBillsCount: 12,
      overdueBillsTrend: 8.3,
      expiringContractsCount: 3,
    });
  }),

  // GET /api/dashboard/trend — 12 months collection trend
  http.get('/api/dashboard/trend', () => {
    const trend = [
      { month: '2024-06', receivable: 268000, collected: 241200 },
      { month: '2024-07', receivable: 272000, collected: 248800 },
      { month: '2024-08', receivable: 275000, collected: 253000 },
      { month: '2024-09', receivable: 270000, collected: 245700 },
      { month: '2024-10', receivable: 278000, collected: 258540 },
      { month: '2024-11', receivable: 280000, collected: 260400 },
      { month: '2024-12', receivable: 282000, collected: 253800 },
      { month: '2025-01', receivable: 280000, collected: 252000 },
      { month: '2025-02', receivable: 265000, collected: 238500 },
      { month: '2025-03', receivable: 278000, collected: 255760 },
      { month: '2025-04', receivable: 282000, collected: 261060 },
      { month: '2025-05', receivable: 285000, collected: 256500 },
    ];
    return HttpResponse.json(trend);
  }),

  // GET /api/dashboard/repair-distribution — repair status distribution
  http.get('/api/dashboard/repair-distribution', () => {
    const distribution = [
      { status: 'SUBMITTED', label: '待分配', count: 5 },
      { status: 'ASSIGNED', label: '已分配', count: 3 },
      { status: 'IN_PROGRESS', label: '处理中', count: 4 },
      { status: 'COMPLETED', label: '已完成', count: 8 },
      { status: 'RATED', label: '已评价', count: 12 },
    ];
    return HttpResponse.json(distribution);
  }),

  // GET /api/dashboard/todos — todo items
  http.get('/api/dashboard/todos', () => {
    const todos = [
      { id: 'todo-001', type: 'contract', title: '合同即将到期', description: '租户张三的合同（CT-2025010）将于2025-06-15到期', targetUrl: '/contracts', deadline: '2025-06-15', createdAt: '2025-05-20T08:00:00Z' },
      { id: 'todo-002', type: 'contract', title: '合同即将到期', description: '租户李四的合同（CT-2025018）将于2025-06-20到期', targetUrl: '/contracts', deadline: '2025-06-20', createdAt: '2025-05-20T08:00:00Z' },
      { id: 'todo-003', type: 'contract', title: '合同即将到期', description: '租户王五的合同（CT-2025022）将于2025-06-25到期', targetUrl: '/contracts', deadline: '2025-06-25', createdAt: '2025-05-20T08:00:00Z' },
      { id: 'todo-004', type: 'billing', title: '逾期账单催缴', description: '有12条账单已逾期，涉及金额¥35,800.00', targetUrl: '/billing/bills', createdAt: '2025-05-22T09:00:00Z' },
      { id: 'todo-005', type: 'repair', title: '紧急工单待处理', description: '有5个待分配的报修工单需要尽快处理', targetUrl: '/service/repairs', createdAt: '2025-05-24T07:00:00Z' },
    ];
    return HttpResponse.json(todos);
  }),

  // GET /api/dashboard/expiring-contracts
  http.get('/api/dashboard/expiring-contracts', ({ request }) => {
    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days') || 30);
    const contracts = [
      { id: 'ct-001', contractNo: 'CT-2025010', renterName: '张三', unitNumber: 'A-1-101', endDate: '2026-06-15', daysRemaining: 12 },
      { id: 'ct-002', contractNo: 'CT-2025018', renterName: '李四', unitNumber: 'B-2-301', endDate: '2026-06-20', daysRemaining: 17 },
      { id: 'ct-003', contractNo: 'CT-2025022', renterName: '王五', unitNumber: 'A-3-502', endDate: '2026-06-25', daysRemaining: 22 },
      { id: 'ct-004', contractNo: 'CT-2025030', renterName: '赵六', unitNumber: 'C-1-201', endDate: '2026-07-15', daysRemaining: 42 },
      { id: 'ct-005', contractNo: 'CT-2025035', renterName: '钱七', unitNumber: 'B-5-601', endDate: '2026-08-10', daysRemaining: 68 },
    ];
    return HttpResponse.json(contracts.filter(c => c.daysRemaining <= days));
  }),

  // GET /api/dashboard/latest-announcements — latest 5 published announcements
  http.get('/api/dashboard/latest-announcements', () => {
    const latest = [
      { id: 'ann-009', title: '电梯维保通知', type: 'NOTICE', publishedAt: '2025-05-20T07:00:00Z' },
      { id: 'ann-008', title: '车位租赁优惠活动', type: 'ACTIVITY', publishedAt: '2025-05-18T08:00:00Z' },
      { id: 'ann-007', title: '消防安全管理规定', type: 'POLICY', publishedAt: '2025-05-17T09:00:00Z' },
      { id: 'ann-006', title: '中秋活动通知', type: 'ACTIVITY', publishedAt: '2025-05-16T10:00:00Z' },
      { id: 'ann-005', title: '小区绿化升级工程通知', type: 'NOTICE', publishedAt: '2025-05-15T14:00:00Z' },
    ];
    return HttpResponse.json(latest);
  }),
];
