import { http, HttpResponse } from 'msw';

interface MockNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  targetUrl?: string;
  senderId?: string;
  senderName?: string;
  createdAt: string;
}

const notifications: MockNotification[] = [
  // SYSTEM x5
  { id: 'noti-001', type: 'SYSTEM', title: '系统升级通知', content: '系统将于今晚22:00-23:00进行维护升级，届时部分功能可能暂时不可用。', read: false, createdAt: '2025-05-24T08:00:00Z' },
  { id: 'noti-002', type: 'SYSTEM', title: '密码修改提醒', content: '您已超过90天未修改密码，为保障账户安全，建议及时更新密码。', read: false, createdAt: '2025-05-23T10:00:00Z' },
  { id: 'noti-003', type: 'SYSTEM', title: '新功能上线通知', content: '仪表盘数据分析功能已上线，您可以在仪表盘页面查看运营数据概览。', read: true, createdAt: '2025-05-22T09:00:00Z' },
  { id: 'noti-004', type: 'SYSTEM', title: '账户登录异常', content: '检测到您的账户在异地登录，如非本人操作请及时修改密码。', read: true, createdAt: '2025-05-21T14:00:00Z' },
  { id: 'noti-005', type: 'SYSTEM', title: '服务条款更新', content: '我们更新了服务条款，请登录后查看最新条款内容。', read: true, createdAt: '2025-05-20T11:00:00Z' },
  // REPAIR x5
  { id: 'noti-006', type: 'REPAIR', title: '新报修工单待处理', content: '张三提交了一个水管漏水的报修工单（RO-2025001），请尽快分配工程师。', read: false, targetUrl: '/service/repairs/repair-001', senderName: '张三', createdAt: '2025-05-24T07:30:00Z' },
  { id: 'noti-007', type: 'REPAIR', title: '工单已完成', content: '报修工单 RO-2025003（电路故障）已由工程师李四维修完成。', read: false, targetUrl: '/service/repairs/repair-003', senderName: '李四', createdAt: '2025-05-23T16:00:00Z' },
  { id: 'noti-008', type: 'REPAIR', title: '工单评价通知', content: '租户王五对工单 RO-2025005 的维修服务评价为5星，评语"非常满意"。', read: true, targetUrl: '/service/repairs/repair-005', senderName: '王五', createdAt: '2025-05-22T13:00:00Z' },
  { id: 'noti-009', type: 'REPAIR', title: '紧急工单提醒', content: '有一个紧急报修工单（门锁损坏）已超过24小时未处理，请尽快跟进。', read: false, targetUrl: '/service/repairs/repair-008', createdAt: '2025-05-21T09:00:00Z' },
  { id: 'noti-010', type: 'REPAIR', title: '工单进度更新', content: '工程师赵六已更新工单 RO-2025010 的维修进度：已更换零件，待测试。', read: true, targetUrl: '/service/repairs/repair-010', senderName: '赵六', createdAt: '2025-05-20T15:00:00Z' },
  // BILLING x5
  { id: 'noti-011', type: 'BILLING', title: '新账单已生成', content: '2025年5月物业费账单已生成，共128条待发布账单。', read: false, targetUrl: '/billing/bills', createdAt: '2025-05-24T06:00:00Z' },
  { id: 'noti-012', type: 'BILLING', title: '逾期账单提醒', content: '有12条账单已逾期，涉及金额¥35,800.00，请及时跟进催缴。', read: false, targetUrl: '/billing/bills', createdAt: '2025-05-23T08:00:00Z' },
  { id: 'noti-013', type: 'BILLING', title: '支付成功通知', content: '租户陈七已通过微信支付完成5月物业费缴纳，金额¥2,500.00。', read: true, targetUrl: '/billing/payments', senderName: '陈七', createdAt: '2025-05-22T17:00:00Z' },
  { id: 'noti-014', type: 'BILLING', title: '批量账单生成完成', content: '6月电费账单批量生成完成，成功120条，跳过8条。', read: true, targetUrl: '/billing/bills', createdAt: '2025-05-21T10:30:00Z' },
  { id: 'noti-015', type: 'BILLING', title: '退费申请通知', content: '租户孙八申请退费，金额¥500.00，原因：多缴水费。请审核处理。', read: true, targetUrl: '/billing/bills', senderName: '孙八', createdAt: '2025-05-20T14:00:00Z' },
  // CONTRACT x5
  { id: 'noti-016', type: 'CONTRACT', title: '合同待审批', content: '新建合同 CT-2025038（租户：周九，单元：A栋301）已提交，等待财务审批。', read: false, targetUrl: '/contracts', createdAt: '2025-05-24T09:00:00Z' },
  { id: 'noti-017', type: 'CONTRACT', title: '合同审批通过', content: '合同 CT-2025035 已通过财务审批，等待管理员签署。', read: true, targetUrl: '/contracts', createdAt: '2025-05-23T11:00:00Z' },
  { id: 'noti-018', type: 'CONTRACT', title: '合同即将到期', content: '合同 CT-2025010（租户：吴十）将于30天内到期，请及时跟进续签事宜。', read: false, targetUrl: '/contracts', createdAt: '2025-05-22T08:00:00Z' },
  { id: 'noti-019', type: 'CONTRACT', title: '合同已终止', content: '合同 CT-2025020 已被管理员终止，终止原因：租户违约。', read: true, targetUrl: '/contracts', createdAt: '2025-05-21T16:00:00Z' },
  { id: 'noti-020', type: 'CONTRACT', title: '续签合同创建成功', content: '合同 CT-2025015 的续签合同已自动创建为草稿状态，请完善信息后提交审批。', read: true, targetUrl: '/contracts', createdAt: '2025-05-20T09:30:00Z' },
];

export const notificationHandlers = [
  // GET /api/notifications — list with pagination + filter
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const type = url.searchParams.get('type') || '';
    const readParam = url.searchParams.get('read');

    let filtered = [...notifications];
    if (type) filtered = filtered.filter((n) => n.type === type);
    if (readParam !== null && readParam !== '') {
      const isRead = readParam === 'true';
      filtered = filtered.filter((n) => n.read === isRead);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    // Include unread count in response
    const unreadCount = notifications.filter((n) => !n.read).length;

    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize), unreadCount });
  }),

  // PATCH /api/notifications/:id/read — mark single as read
  http.patch('/api/notifications/:id/read', ({ params }) => {
    const item = notifications.find((n) => n.id === params.id);
    if (!item) return new HttpResponse(null, { status: 404 });
    item.read = true;
    return HttpResponse.json({ success: true });
  }),

  // PATCH /api/notifications/read — batch mark as read
  http.patch('/api/notifications/read', async ({ request }) => {
    const body = (await request.json()) as { ids: string[] };
    body.ids.forEach((id) => {
      const item = notifications.find((n) => n.id === id);
      if (item) item.read = true;
    });
    return HttpResponse.json({ success: true });
  }),

  // PATCH /api/notifications/read-all — mark all as read
  http.patch('/api/notifications/read-all', () => {
    notifications.forEach((n) => { n.read = true; });
    return HttpResponse.json({ success: true });
  }),
];
