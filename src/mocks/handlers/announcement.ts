import { http, HttpResponse } from 'msw';

interface MockAnnouncement {
  id: string;
  title: string;
  type: string;
  scope: string;
  projectIds?: string[];
  projectNames?: string[];
  content: string;
  attachment?: string;
  status: string;
  publisherId?: string;
  publisherName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const announcements: MockAnnouncement[] = [
  // DRAFT x4
  {
    id: 'ann-001', title: '关于物业费调整的通知', type: 'NOTICE', scope: 'ALL',
    content: '尊敬的业主/住户：\n\n根据市场价格变动及物业运营成本调整，经物业管理委员会研究决定，自下月起物业管理费将进行适度调整。\n\n具体调整方案将在公示期结束后正式执行，请各位业主及时关注后续通知。',
    status: 'DRAFT', createdAt: '2025-05-01T08:00:00Z', updatedAt: '2025-05-01T08:00:00Z',
  },
  {
    id: 'ann-002', title: '端午节放假通知', type: 'NOTICE', scope: 'ALL',
    content: '各位业主/住户：\n\n端午节假期期间（6月10日-12日），物业服务中心将安排值班人员，如有紧急事项请拨打值班电话。\n\n祝大家端午安康！',
    status: 'DRAFT', createdAt: '2025-05-05T09:00:00Z', updatedAt: '2025-05-05T09:00:00Z',
  },
  {
    id: 'ann-003', title: '夏季游泳池开放活动', type: 'ACTIVITY', scope: 'PROJECT',
    projectIds: ['project-001'], projectNames: ['翡翠湾花园'],
    content: '翡翠湾花园小区游泳池将于6月15日起正式开放！\n\n开放时间：每日 14:00-21:00\n业主凭业主卡免费入场，访客需购买单次票。\n\n欢迎大家前来畅游消暑！',
    status: 'DRAFT', createdAt: '2025-05-08T10:00:00Z', updatedAt: '2025-05-08T10:00:00Z',
  },
  {
    id: 'ann-004', title: '垃圾分类政策更新', type: 'POLICY', scope: 'ALL',
    content: '根据最新城市管理条例要求，小区将严格执行垃圾分类制度。\n\n自7月1日起，未按规定分类投放垃圾的，物业将进行劝导和提醒。\n\n请各位住户积极配合，共建美好家园。',
    status: 'DRAFT', createdAt: '2025-05-10T11:00:00Z', updatedAt: '2025-05-10T11:00:00Z',
  },
  // PUBLISHED x5
  {
    id: 'ann-005', title: '小区绿化升级工程通知', type: 'NOTICE', scope: 'ALL',
    content: '各位业主/住户：\n\n为提升小区整体环境品质，物业管理处将于5月20日起对小区中庭花园进行绿化升级改造。\n\n施工期间可能会有噪音影响，敬请理解与配合。工程预计6月底完工。',
    status: 'PUBLISHED', publisherId: 'user-001', publisherName: '王管理', publishedAt: '2025-05-15T14:00:00Z',
    createdAt: '2025-05-12T09:00:00Z', updatedAt: '2025-05-15T14:00:00Z',
  },
  {
    id: 'ann-006', title: '中秋活动通知', type: 'ACTIVITY', scope: 'ALL',
    content: '一年一度的中秋佳节即将来临！\n\n物业管理处将在中秋节当天举办"月圆人团圆"社区活动，届时将有猜灯谜、品月饼、做花灯等精彩环节。\n\n欢迎各位业主携家人踊跃参加！',
    status: 'PUBLISHED', publisherId: 'user-001', publisherName: '王管理', publishedAt: '2025-05-16T10:00:00Z',
    createdAt: '2025-05-14T08:00:00Z', updatedAt: '2025-05-16T10:00:00Z',
  },
  {
    id: 'ann-007', title: '消防安全管理规定', type: 'POLICY', scope: 'ALL',
    content: '为保障小区消防安全，特制定以下管理规定：\n\n1. 严禁在楼道堆放杂物\n2. 严禁电动车入楼充电\n3. 定期检查家庭消防器材\n\n违反规定者将按照物业管理条例进行处理。',
    status: 'PUBLISHED', publisherId: 'user-002', publisherName: '李主任', publishedAt: '2025-05-17T09:00:00Z',
    createdAt: '2025-05-15T11:00:00Z', updatedAt: '2025-05-17T09:00:00Z',
  },
  {
    id: 'ann-008', title: '车位租赁优惠活动', type: 'ACTIVITY', scope: 'PROJECT',
    projectIds: ['project-002'], projectNames: ['阳光城'],
    content: '阳光城小区地下车位限时优惠活动！\n\n活动时间：即日起至6月30日\n优惠内容：年租车位享9折优惠，新租户首月免费。\n\n详情请咨询物业服务中心。',
    status: 'PUBLISHED', publisherId: 'user-001', publisherName: '王管理', publishedAt: '2025-05-18T08:00:00Z',
    createdAt: '2025-05-17T15:00:00Z', updatedAt: '2025-05-18T08:00:00Z',
  },
  {
    id: 'ann-009', title: '电梯维保通知', type: 'NOTICE', scope: 'PROJECT',
    projectIds: ['project-001'], projectNames: ['翡翠湾花园'],
    content: '翡翠湾花园各楼栋电梯将于5月25日进行季度维保检查。\n\n维保时间：8:00-18:00，届时电梯将逐台停运检修。\n\n请各位住户提前做好出行安排，不便之处敬请谅解。',
    status: 'PUBLISHED', publisherId: 'user-002', publisherName: '李主任', publishedAt: '2025-05-20T07:00:00Z',
    createdAt: '2025-05-19T14:00:00Z', updatedAt: '2025-05-20T07:00:00Z',
  },
  // ARCHIVED x3
  {
    id: 'ann-010', title: '春节放假通知', type: 'NOTICE', scope: 'ALL',
    content: '各位业主/住户：\n\n春节假期期间，物业服务中心将安排值班。如有紧急事项请拨打值班电话。\n\n提前祝大家新春快乐、万事如意！',
    status: 'ARCHIVED', publisherId: 'user-001', publisherName: '王管理', publishedAt: '2025-01-20T09:00:00Z',
    createdAt: '2025-01-18T10:00:00Z', updatedAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'ann-011', title: '元旦联欢会', type: 'ACTIVITY', scope: 'ALL',
    content: '辞旧迎新之际，物业管理处举办社区元旦联欢晚会。\n\n节目包括：歌舞表演、抽奖环节、亲子游戏等。\n\n活动已圆满结束，感谢各位业主的热情参与！',
    status: 'ARCHIVED', publisherId: 'user-002', publisherName: '李主任', publishedAt: '2024-12-25T10:00:00Z',
    createdAt: '2024-12-20T09:00:00Z', updatedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'ann-012', title: '旧版停车管理规定', type: 'POLICY', scope: 'ALL',
    content: '此为旧版停车管理规定，已被新版替代。\n\n请参阅最新发布的停车管理规定。',
    status: 'ARCHIVED', publisherId: 'user-001', publisherName: '王管理', publishedAt: '2024-11-01T09:00:00Z',
    createdAt: '2024-10-25T10:00:00Z', updatedAt: '2025-03-01T08:00:00Z',
  },
];

let nextId = 13;

export const announcementHandlers = [
  // GET /api/announcements — list with pagination + filter
  http.get('/api/announcements', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword') || '';
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';

    let filtered = [...announcements];
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (type) filtered = filtered.filter((a) => a.type === type);
    if (keyword) filtered = filtered.filter((a) => a.title.includes(keyword));

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  // GET /api/announcements/:id — detail
  http.get('/api/announcements/:id', ({ params }) => {
    const item = announcements.find((a) => a.id === params.id);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  // POST /api/announcements — create
  http.post('/api/announcements', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const item: MockAnnouncement = {
      id: `ann-${String(nextId++).padStart(3, '0')}`,
      title: (body.title as string) || '',
      type: (body.type as string) || 'NOTICE',
      scope: (body.scope as string) || 'ALL',
      projectIds: body.projectIds as string[] | undefined,
      projectNames: body.scope === 'PROJECT' ? ['示例项目'] : undefined,
      content: (body.content as string) || '',
      attachment: body.attachment as string | undefined,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };
    announcements.unshift(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  // PATCH /api/announcements/:id — update (including publish/archive)
  http.patch('/api/announcements/:id', async ({ params, request }) => {
    const idx = announcements.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const item = announcements[idx];

    // Apply updates
    if (body.title !== undefined) item.title = body.title as string;
    if (body.type !== undefined) item.type = body.type as string;
    if (body.scope !== undefined) item.scope = body.scope as string;
    if (body.projectIds !== undefined) item.projectIds = body.projectIds as string[];
    if (body.content !== undefined) item.content = body.content as string;
    if (body.attachment !== undefined) item.attachment = body.attachment as string;
    if (body.status !== undefined) item.status = body.status as string;
    if (body.publishedAt !== undefined) item.publishedAt = body.publishedAt as string;

    // If publishing, set publisher info
    if (body.status === 'PUBLISHED') {
      item.publisherId = item.publisherId || 'user-001';
      item.publisherName = item.publisherName || '当前用户';
      item.publishedAt = item.publishedAt || new Date().toISOString();
    }

    item.updatedAt = new Date().toISOString();
    return HttpResponse.json(item);
  }),

  // DELETE /api/announcements/:id
  http.delete('/api/announcements/:id', ({ params }) => {
    const idx = announcements.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    announcements.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
