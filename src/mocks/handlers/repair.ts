import { http, HttpResponse } from 'msw';

const renterNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇', '胡艳', '朱杰', '高涛'];
const engineerNames = ['工程师-王刚', '工程师-李强', '工程师-赵明', '工程师-孙磊', '工程师-周伟'];
const repairTypes = ['ELECTRICAL', 'PLUMBING', 'DOOR_WINDOW', 'APPLIANCE', 'OTHER'] as const;
const urgencies = ['HIGH', 'MEDIUM', 'LOW'] as const;
const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'] as const;

const repairTitles = [
  '卫生间漏水', '空调不制冷', '门锁损坏', '灯泡不亮', '马桶堵塞',
  '窗户无法关闭', '热水器故障', '插座无电', '水龙头漏水', '洗衣机异响',
  '电梯按钮失灵', '墙面开裂', '排水管堵塞', '冰箱不制冷', '门把手松动',
];

function buildTimeline(status: string, idx: number) {
  const base = new Date(2025, 3, 1 + idx).toISOString();
  const timeline = [
    { id: `tl-r${idx}-1`, action: 'SUBMIT', operatorId: `renter-${String((idx % 15) + 1).padStart(3, '0')}`, operatorName: renterNames[idx % 15], remark: '提交报修', createdAt: base },
  ];
  if (['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'].includes(status)) {
    timeline.push({ id: `tl-r${idx}-2`, action: 'ASSIGN', operatorId: 'staff-cs-001', operatorName: '客服-小李', remark: `分配给${engineerNames[idx % 5]}`, createdAt: new Date(new Date(base).getTime() + 3600000).toISOString() });
  }
  if (['IN_PROGRESS', 'COMPLETED', 'RATED'].includes(status)) {
    timeline.push({ id: `tl-r${idx}-3`, action: 'PROGRESS', operatorId: `eng-${String((idx % 5) + 1).padStart(3, '0')}`, operatorName: engineerNames[idx % 5], remark: '已到达现场，正在处理', createdAt: new Date(new Date(base).getTime() + 7200000).toISOString() });
  }
  if (['COMPLETED', 'RATED'].includes(status)) {
    timeline.push({ id: `tl-r${idx}-4`, action: 'COMPLETE', operatorId: `eng-${String((idx % 5) + 1).padStart(3, '0')}`, operatorName: engineerNames[idx % 5], remark: '维修完成', createdAt: new Date(new Date(base).getTime() + 14400000).toISOString() });
  }
  if (status === 'RATED') {
    timeline.push({ id: `tl-r${idx}-5`, action: 'RATE', operatorId: `renter-${String((idx % 15) + 1).padStart(3, '0')}`, operatorName: renterNames[idx % 15], remark: '评价完成', createdAt: new Date(new Date(base).getTime() + 28800000).toISOString() });
  }
  return timeline;
}

const repairs = Array.from({ length: 15 }, (_, i) => {
  const statusIdx = Math.floor(i / 3);
  const status = statuses[statusIdx];
  const hasEngineer = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RATED'].includes(status);
  const isCompleted = ['COMPLETED', 'RATED'].includes(status);
  const isRated = status === 'RATED';
  const baseDate = new Date(2025, 3, 1 + i);

  return {
    id: `repair-${String(i + 1).padStart(3, '0')}`,
    repairNo: `RO-20250401-${String(i + 1).padStart(3, '0')}`,
    title: repairTitles[i],
    description: `${repairTitles[i]}，请尽快处理。位于${Math.floor(i / 3) + 1}楼${String((i % 4) + 1).padStart(2, '0')}室。`,
    images: [],
    renterId: `renter-${String((i % 15) + 1).padStart(3, '0')}`,
    renterName: renterNames[i % 15],
    unitId: `unit-${String((i % 10) + 1).padStart(3, '0')}`,
    unitNumber: `${Math.floor(i / 3) + 1}${String((i % 4) + 1).padStart(2, '0')}`,
    repairType: repairTypes[i % 5],
    urgency: urgencies[i % 3],
    status,
    engineerId: hasEngineer ? `eng-${String((i % 5) + 1).padStart(3, '0')}` : undefined,
    engineerName: hasEngineer ? engineerNames[i % 5] : undefined,
    rating: isRated ? (3 + (i % 3)) : undefined,
    ratingComment: isRated ? '维修及时，服务不错' : undefined,
    submittedAt: baseDate.toISOString(),
    assignedAt: hasEngineer ? new Date(baseDate.getTime() + 3600000).toISOString() : undefined,
    completedAt: isCompleted ? new Date(baseDate.getTime() + 14400000).toISOString() : undefined,
    ratedAt: isRated ? new Date(baseDate.getTime() + 28800000).toISOString() : undefined,
    timeline: buildTimeline(status, i),
    createdAt: baseDate.toISOString(),
    updatedAt: new Date(baseDate.getTime() + (statusIdx * 3600000)).toISOString(),
  };
});

const messages: Record<string, Array<{ id: string; repairId: string; senderId: string; senderName: string; senderRole: string; content: string; images: string[]; createdAt: string }>> = {};

repairs.forEach((r) => {
  const base = new Date(r.submittedAt).getTime();
  const msgs = [
    { id: `msg-${r.id}-1`, repairId: r.id, senderId: r.renterId, senderName: r.renterName, senderRole: 'TENANT', content: `您好，${r.title}，麻烦帮忙处理一下。`, images: [], createdAt: new Date(base).toISOString() },
    { id: `msg-${r.id}-2`, repairId: r.id, senderId: 'staff-cs-001', senderName: '客服-小李', senderRole: 'CUSTOMER_SERVICE', content: '收到，我们会尽快安排工程师上门。', images: [], createdAt: new Date(base + 600000).toISOString() },
    { id: `msg-${r.id}-3`, repairId: r.id, senderId: r.renterId, senderName: r.renterName, senderRole: 'TENANT', content: '好的，谢谢！', images: [], createdAt: new Date(base + 1200000).toISOString() },
  ];
  if (r.engineerName) {
    msgs.push({ id: `msg-${r.id}-4`, repairId: r.id, senderId: r.engineerId!, senderName: r.engineerName, senderRole: 'ENGINEER', content: '您好，我是负责的工程师，预计30分钟后到达。', images: [], createdAt: new Date(base + 3600000).toISOString() });
    msgs.push({ id: `msg-${r.id}-5`, repairId: r.id, senderId: r.renterId, senderName: r.renterName, senderRole: 'TENANT', content: '好的，等您来。', images: [], createdAt: new Date(base + 3900000).toISOString() });
  }
  messages[r.id] = msgs;
});

let msgCounter = 100;

export const repairHandlers = [
  http.get('/api/repairs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const repairType = url.searchParams.get('repairType');
    const urgency = url.searchParams.get('urgency');

    const unitId = url.searchParams.get('unitId');

    let filtered = [...repairs];
    if (keyword) filtered = filtered.filter((r) => r.repairNo.includes(keyword) || r.renterName.includes(keyword) || r.unitNumber.includes(keyword));
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (repairType) filtered = filtered.filter((r) => r.repairType === repairType);
    if (urgency) filtered = filtered.filter((r) => r.urgency === urgency);
    if (unitId) filtered = filtered.filter((r) => r.unitId === unitId);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/repairs/:id', ({ params }) => {
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/api/repairs/:id/assign', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    item.status = 'ASSIGNED';
    item.engineerId = body.engineerId as string;
    item.engineerName = body.engineerName as string || engineerNames[0];
    item.assignedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-assign-${Date.now()}`,
      action: 'ASSIGN',
      operatorId: 'staff-cs-001',
      operatorName: '客服-小李',
      remark: body.remark as string || `分配给${item.engineerName}`,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/repairs/:id/progress', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    item.status = 'IN_PROGRESS';
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-progress-${Date.now()}`,
      action: 'PROGRESS',
      operatorId: item.engineerId || 'eng-001',
      operatorName: item.engineerName || '工程师',
      remark: body.description as string,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/repairs/:id/complete', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    item.status = 'COMPLETED';
    item.completedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-complete-${Date.now()}`,
      action: 'COMPLETE',
      operatorId: item.engineerId || 'eng-001',
      operatorName: item.engineerName || '工程师',
      remark: body.summary as string,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/repairs/:id/rating', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    item.status = 'RATED';
    item.rating = body.score as number;
    item.ratingComment = body.comment as string;
    item.ratedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-rate-${Date.now()}`,
      action: 'RATE',
      operatorId: item.renterId,
      operatorName: item.renterName,
      remark: `评分：${body.score}`,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.get('/api/repairs/:id/messages', ({ params }) => {
    const msgs = messages[params.id as string] ?? [];
    return HttpResponse.json(msgs);
  }),

  http.post('/api/repairs/:id/messages', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const repairId = params.id as string;
    if (!messages[repairId]) messages[repairId] = [];
    const msg = {
      id: `msg-${repairId}-${++msgCounter}`,
      repairId,
      senderId: 'current-user',
      senderName: '当前用户',
      senderRole: 'STAFF',
      content: body.content as string,
      images: (body.images as string[]) ?? [],
      createdAt: new Date().toISOString(),
    };
    messages[repairId].push(msg);
    return HttpResponse.json(msg, { status: 201 });
  }),

  http.get('/api/repairs/:id/timeline', ({ params }) => {
    const item = repairs.find((r) => r.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '工单不存在' }, { status: 404 });
    return HttpResponse.json(item.timeline);
  }),
];
