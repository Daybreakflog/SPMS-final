import { http, HttpResponse } from 'msw';

// ⚠ MSW DRIFT MARKER
//   Swagger 1.0 仅定义了：
//     GET   /api/notifications
//     PATCH /api/notifications/:id/read
//     PATCH /api/notifications/read
//     PATCH /api/notifications/read-all
//   下列由 notificationCenterHandlers 暴露的端点 Swagger 未定义：
//     GET    /api/notification/list
//     GET    /api/notification/stats
//     PUT    /api/notification/:id/read
//     PUT    /api/notification/read-all
//     POST   /api/notification/batch-delete
//     DELETE /api/notification/:id
//     GET    /api/notification/preferences
//     PUT    /api/notification/preferences
//   后端实现统一前缀前请勿当作真实接口依赖。

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
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
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

// ===== Sprint 17: 实时通知中心（/api/notification/*） =====
type CenterType = 'CONTRACT_EXPIRY' | 'BILL_OVERDUE' | 'REPAIR_ASSIGNED' | 'SYSTEM';

interface CenterNotification {
  id: string;
  type: CenterType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  linkPath?: string;
}

const centerNotifications: CenterNotification[] = [
  { id: 'nc-001', type: 'CONTRACT_EXPIRY', title: '合同即将到期', content: '合同 CT-2025010（吴十）将于15天后到期，请及时跟进续签。', isRead: false, createdAt: '2026-06-07T09:00:00Z', linkPath: '/contracts' },
  { id: 'nc-002', type: 'BILL_OVERDUE', title: '账单逾期提醒', content: '有12条账单已逾期，涉及金额¥35,800.00。', isRead: false, createdAt: '2026-06-07T08:30:00Z', linkPath: '/billing/bills' },
  { id: 'nc-003', type: 'REPAIR_ASSIGNED', title: '新工单待派单', content: '张三提交水管漏水报修工单 RO-2026001。', isRead: false, createdAt: '2026-06-07T08:00:00Z', linkPath: '/service/repairs' },
  { id: 'nc-004', type: 'SYSTEM', title: '系统升级通知', content: '系统将于今晚22:00进行维护升级。', isRead: true, createdAt: '2026-06-06T20:00:00Z' },
  { id: 'nc-005', type: 'CONTRACT_EXPIRY', title: '合同到期提醒', content: '合同 CT-2025022（周九）将于28天后到期。', isRead: true, createdAt: '2026-06-06T10:00:00Z', linkPath: '/contracts' },
  { id: 'nc-006', type: 'BILL_OVERDUE', title: '欠费跟进', content: '租户孙八5月物业费逾期未缴，请催缴。', isRead: true, createdAt: '2026-06-05T14:00:00Z', linkPath: '/billing/bills' },
  { id: 'nc-007', type: 'REPAIR_ASSIGNED', title: '工单已分配', content: '工单 RO-2026003 已分配给工程师李四。', isRead: true, createdAt: '2026-06-05T11:00:00Z', linkPath: '/service/repairs' },
  { id: 'nc-008', type: 'SYSTEM', title: '密码安全提醒', content: '您已超过90天未修改密码，建议及时更新。', isRead: true, createdAt: '2026-06-04T09:00:00Z' },
  { id: 'nc-009', type: 'CONTRACT_EXPIRY', title: '合同到期提醒', content: '合同 CT-2025030（郑十一）将于30天后到期。', isRead: true, createdAt: '2026-06-03T09:00:00Z', linkPath: '/contracts' },
  { id: 'nc-010', type: 'BILL_OVERDUE', title: '逾期账单汇总', content: '本周新增逾期账单3条。', isRead: true, createdAt: '2026-06-02T09:00:00Z', linkPath: '/billing/bills' },
];

export const notificationCenterHandlers = [
  // GET /api/notification/list
  http.get('/api/notification/list', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const isReadParam = url.searchParams.get('isRead');

    let filtered = [...centerNotifications];
    if (isReadParam !== null && isReadParam !== '') {
      const isRead = isReadParam === 'true';
      filtered = filtered.filter((n) => n.isRead === isRead);
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  // GET /api/notification/stats
  http.get('/api/notification/stats', () => {
    const unread = centerNotifications.filter((n) => !n.isRead).length;
    return HttpResponse.json({ total: centerNotifications.length, unread });
  }),

  // PUT /api/notification/:id/read
  http.put('/api/notification/:id/read', ({ params }) => {
    const item = centerNotifications.find((n) => n.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '通知不存在', data: null }, { status: 404 });
    item.isRead = true;
    return HttpResponse.json({ success: true });
  }),

  // PUT /api/notification/read-all
  http.put('/api/notification/read-all', () => {
    centerNotifications.forEach((n) => { n.isRead = true; });
    return HttpResponse.json({ success: true });
  }),

  // POST /api/notification/batch-delete — 批量删除
  http.post('/api/notification/batch-delete', async ({ request }) => {
    const body = (await request.json()) as { ids: string[] };
    (body.ids ?? []).forEach((id) => {
      const idx = centerNotifications.findIndex((n) => n.id === id);
      if (idx !== -1) centerNotifications.splice(idx, 1);
    });
    return HttpResponse.json({ success: true });
  }),

  // DELETE /api/notification/:id
  http.delete('/api/notification/:id', ({ params }) => {
    const idx = centerNotifications.findIndex((n) => n.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '通知不存在', data: null }, { status: 404 });
    centerNotifications.splice(idx, 1);
    return HttpResponse.json({ success: true });
  }),

  // GET /api/notification/preferences — 有状态偏好
  http.get('/api/notification/preferences', () => {
    return HttpResponse.json(notificationPreferences);
  }),

  // PUT /api/notification/preferences — 更新偏好
  http.put('/api/notification/preferences', async ({ request }) => {
    const body = (await request.json()) as { preferences: { type: CenterType; enabled: boolean }[] };
    (body.preferences ?? []).forEach((p) => {
      const item = notificationPreferences.find((x) => x.type === p.type);
      if (item) item.enabled = p.enabled;
    });
    return HttpResponse.json({ success: true });
  }),
];

const notificationPreferences: { type: CenterType; enabled: boolean }[] = [
  { type: 'CONTRACT_EXPIRY', enabled: true },
  { type: 'BILL_OVERDUE', enabled: true },
  { type: 'REPAIR_ASSIGNED', enabled: true },
  { type: 'SYSTEM', enabled: false },
];
