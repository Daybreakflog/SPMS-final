import { http, HttpResponse } from 'msw';

const complainantNames = ['张伟', '李芳', '王娜', '刘秀英', '陈敏', '杨静', '赵丽', '黄强', '周磊', '吴军', '徐洋', '孙勇'];
const targetTypes = ['PROJECT', 'STAFF', 'EVENT'] as const;
const severities = ['HIGH', 'MEDIUM', 'LOW'] as const;
const statuses = ['SUBMITTED', 'ANALYZING', 'APPEALING', 'CLOSED'] as const;
const targetNames = ['前台客服小王', '保洁服务', '电梯设施', '安保人员小李', '维修服务', '消防设施', '物业管理员', '绿化服务', '停车设施', '前台服务', '水电维修', '健身设施'];

const complaintTitles = [
  '前台态度恶劣', '保洁不及时', '电梯频繁故障',
  '安保巡逻不到位', '维修响应慢', '消防通道被堵',
  '物业费收取不合理', '绿化维护差', '停车位分配不公',
  '服务态度差', '水电维修质量差', '健身房设备损坏',
];

function buildTimeline(status: string, idx: number) {
  const base = new Date(2025, 3, 5 + idx).toISOString();
  const timeline = [
    { id: `tl-c${idx}-1`, action: 'SUBMIT', operatorId: `renter-${String((idx % 12) + 1).padStart(3, '0')}`, operatorName: complainantNames[idx % 12], remark: '提交投诉', createdAt: base },
  ];
  if (['ANALYZING', 'APPEALING', 'CLOSED'].includes(status)) {
    timeline.push({ id: `tl-c${idx}-2`, action: 'ANALYZE', operatorId: 'staff-ops-001', operatorName: '运营-张经理', remark: '完成运营分析', createdAt: new Date(new Date(base).getTime() + 86400000).toISOString() });
  }
  if (['APPEALING', 'CLOSED'].includes(status)) {
    timeline.push({ id: `tl-c${idx}-3`, action: 'APPEAL', operatorId: 'staff-eng-001', operatorName: '工程师-王刚', remark: '提交申诉', createdAt: new Date(new Date(base).getTime() + 172800000).toISOString() });
  }
  if (status === 'CLOSED') {
    timeline.push({ id: `tl-c${idx}-4`, action: 'RESOLVE_APPEAL', operatorId: 'staff-ops-001', operatorName: '运营-张经理', remark: '处理申诉', createdAt: new Date(new Date(base).getTime() + 259200000).toISOString() });
    timeline.push({ id: `tl-c${idx}-5`, action: 'CLOSE', operatorId: 'staff-ops-001', operatorName: '运营-张经理', remark: '关闭投诉', createdAt: new Date(new Date(base).getTime() + 345600000).toISOString() });
  }
  return timeline;
}

const complaints = Array.from({ length: 12 }, (_, i) => {
  const statusIdx = Math.floor(i / 3);
  const status = statuses[statusIdx];
  const baseDate = new Date(2025, 3, 5 + i);
  const hasAnalysis = ['ANALYZING', 'APPEALING', 'CLOSED'].includes(status);
  const hasAppeals = ['APPEALING', 'CLOSED'].includes(status);
  const isClosed = status === 'CLOSED';

  return {
    id: `complaint-${String(i + 1).padStart(3, '0')}`,
    complaintNo: `CP-20250405-${String(i + 1).padStart(3, '0')}`,
    title: complaintTitles[i],
    description: `${complaintTitles[i]}，严重影响了日常生活，希望物业尽快处理。`,
    images: [],
    complainantId: `renter-${String((i % 12) + 1).padStart(3, '0')}`,
    complainantName: complainantNames[i % 12],
    targetType: targetTypes[i % 3],
    targetName: targetNames[i],
    severity: severities[i % 3],
    status,
    assigneeId: hasAnalysis ? 'staff-ops-001' : undefined,
    assigneeName: hasAnalysis ? '运营-张经理' : undefined,
    analysis: hasAnalysis ? {
      conclusion: '经调查核实，投诉情况属实。',
      responsibility: `${targetNames[i]}相关负责人需承担主要责任。`,
      suggestion: '建议加强培训和管理，制定整改方案。',
      result: '已对相关人员进行批评教育，要求限期整改。',
      operatorId: 'staff-ops-001',
      operatorName: '运营-张经理',
      createdAt: new Date(baseDate.getTime() + 86400000).toISOString(),
    } : undefined,
    appeals: hasAppeals ? [
      {
        id: `appeal-${i}-1`,
        reason: '对分析结论有异议，实际情况与调查结果不符，申请重新审查。',
        evidence: [] as string[],
        status: isClosed ? (['ACCEPTED', 'REJECTED'] as const)[i % 2] : 'PENDING',
        resolveOpinion: isClosed ? (i % 2 === 0 ? '经复查，采纳申诉意见，调整处理结论。' : '经复查，维持原有结论。') : undefined,
        appealerId: 'staff-eng-001',
        appealerName: '工程师-王刚',
        resolverId: isClosed ? 'staff-ops-001' : undefined,
        resolverName: isClosed ? '运营-张经理' : undefined,
        createdAt: new Date(baseDate.getTime() + 172800000).toISOString(),
        resolvedAt: isClosed ? new Date(baseDate.getTime() + 259200000).toISOString() : undefined,
      },
      ...(i % 3 === 0 ? [{
        id: `appeal-${i}-2`,
        reason: '补充新证据，申请再次审查。',
        evidence: [] as string[],
        status: isClosed ? 'REJECTED' as const : 'PENDING' as const,
        resolveOpinion: isClosed ? '证据不充分，维持原结论。' : undefined,
        appealerId: 'staff-cs-002',
        appealerName: '客服-小张',
        resolverId: isClosed ? 'staff-ops-001' : undefined,
        resolverName: isClosed ? '运营-张经理' : undefined,
        createdAt: new Date(baseDate.getTime() + 180000000).toISOString(),
        resolvedAt: isClosed ? new Date(baseDate.getTime() + 260000000).toISOString() : undefined,
      }] : []),
    ] : [],
    timeline: buildTimeline(status, i),
    closedReason: isClosed ? '问题已处理完毕，投诉人确认满意。' : undefined,
    followUp: isClosed ? i % 2 === 0 : undefined,
    submittedAt: baseDate.toISOString(),
    closedAt: isClosed ? new Date(baseDate.getTime() + 345600000).toISOString() : undefined,
    createdAt: baseDate.toISOString(),
    updatedAt: new Date(baseDate.getTime() + (statusIdx * 86400000)).toISOString(),
  };
});

export const complaintHandlers = [
  http.get('/api/complaints', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');
    const targetType = url.searchParams.get('targetType');
    const severity = url.searchParams.get('severity');

    let filtered = [...complaints];
    if (keyword) filtered = filtered.filter((c) => c.complaintNo.includes(keyword) || c.complainantName.includes(keyword));
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (targetType) filtered = filtered.filter((c) => c.targetType === targetType);
    if (severity) filtered = filtered.filter((c) => c.severity === severity);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/api/complaints/:id', ({ params }) => {
    const item = complaints.find((c) => c.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '投诉不存在' }, { status: 404 });
    return HttpResponse.json(item);
  }),

  // POST /api/complaints — 租户提交投诉
  http.post('/api/complaints', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const baseDate = new Date();
    const newComplaint = {
      id: `complaint-${String(complaints.length + 1).padStart(3, '0')}`,
      complaintNo: `CP-${baseDate.getFullYear()}${String(baseDate.getMonth() + 1).padStart(2, '0')}${String(baseDate.getDate()).padStart(2, '0')}-${String(complaints.length + 1).padStart(3, '0')}`,
      title: body.title as string,
      description: body.description as string || '',
      images: (body.images as string[]) ?? [],
      complainantId: 'renter-tc-01',
      complainantName: '张伟',
      targetType: (body.targetType as string) || 'PROJECT',
      targetName: (body.targetName as string) || '',
      severity: (body.severity as string) || 'MEDIUM',
      status: 'SUBMITTED',
      assigneeId: undefined,
      assigneeName: undefined,
      analysis: undefined,
      appeals: [],
      timeline: [{
        id: `tl-c-new-1`,
        action: 'SUBMIT',
        operatorId: 'renter-tc-01',
        operatorName: '张伟',
        remark: '提交投诉',
        createdAt: baseDate.toISOString(),
      }],
      closedReason: undefined,
      followUp: undefined,
      submittedAt: baseDate.toISOString(),
      closedAt: undefined,
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString(),
    };
    complaints.push(newComplaint as unknown as typeof complaints[0]);
    return HttpResponse.json(newComplaint, { status: 201 });
  }),

  http.post('/api/complaints/:id/analysis', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = complaints.find((c) => c.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '投诉不存在' }, { status: 404 });
    item.status = 'ANALYZING';
    item.assigneeId = 'staff-ops-001';
    item.assigneeName = '运营-张经理';
    item.analysis = {
      conclusion: body.conclusion as string,
      responsibility: body.responsibility as string,
      suggestion: body.suggestion as string,
      result: body.result as string,
      operatorId: 'staff-ops-001',
      operatorName: '运营-张经理',
      createdAt: new Date().toISOString(),
    };
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-analyze-${Date.now()}`,
      action: 'ANALYZE',
      operatorId: 'staff-ops-001',
      operatorName: '运营-张经理',
      remark: '完成运营分析',
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/complaints/:id/appeals', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = complaints.find((c) => c.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '投诉不存在' }, { status: 404 });
    item.status = 'APPEALING';
    const appeal = {
      id: `appeal-${item.id}-${Date.now()}`,
      reason: body.reason as string,
      evidence: (body.evidence ?? []) as string[],
      status: 'PENDING' as const,
      resolveOpinion: undefined,
      appealerId: 'current-user',
      appealerName: '当前用户',
      resolverId: undefined,
      resolverName: undefined,
      createdAt: new Date().toISOString(),
      resolvedAt: undefined,
    };
    if (!item.appeals) item.appeals = [];
    item.appeals.push(appeal);
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-appeal-${Date.now()}`,
      action: 'APPEAL',
      operatorId: 'current-user',
      operatorName: '当前用户',
      remark: '提交申诉',
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/complaints/:id/appeals/:appealId/resolve', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = complaints.find((c) => c.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '投诉不存在' }, { status: 404 });
    const appeal = item.appeals?.find((a) => a.id === params.appealId);
    if (!appeal) return HttpResponse.json({ code: 404, message: '申诉不存在' }, { status: 404 });
    appeal.status = body.accepted ? 'ACCEPTED' : 'REJECTED';
    appeal.resolveOpinion = body.opinion as string;
    appeal.resolverId = 'staff-ops-001';
    appeal.resolverName = '运营-张经理';
    appeal.resolvedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-resolve-${Date.now()}`,
      action: 'RESOLVE_APPEAL',
      operatorId: 'staff-ops-001',
      operatorName: '运营-张经理',
      remark: body.accepted ? '采纳申诉' : '驳回申诉',
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

  http.post('/api/complaints/:id/close', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const item = complaints.find((c) => c.id === params.id);
    if (!item) return HttpResponse.json({ code: 404, message: '投诉不存在' }, { status: 404 });
    item.status = 'CLOSED';
    item.closedReason = body.reason as string;
    item.followUp = body.followUp as boolean;
    item.closedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    item.timeline.push({
      id: `tl-${item.id}-close-${Date.now()}`,
      action: 'CLOSE',
      operatorId: 'staff-ops-001',
      operatorName: '运营-张经理',
      remark: body.reason as string,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(item);
  }),

];
