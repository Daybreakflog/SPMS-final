import { http, HttpResponse } from 'msw';

// ⚠ MSW DRIFT MARKER
//   GET /api/reports/financial/fee-analysis 在 Swagger 1.0 中未定义，
//   待后端实现费项分析报表接口后再启用。

const rentIncomeData = {
  kpis: { totalIncome: 5680000, yoyGrowth: 12.5, momGrowth: 3.2, avgUnitPrice: 85.6 },
  chartData: [
    { period: '2025-01', income: 420000, yoyGrowth: 8.2, momGrowth: -3.1 },
    { period: '2025-02', income: 435000, yoyGrowth: 9.5, momGrowth: 3.6 },
    { period: '2025-03', income: 460000, yoyGrowth: 11.2, momGrowth: 5.7 },
    { period: '2025-04', income: 448000, yoyGrowth: 10.8, momGrowth: -2.6 },
    { period: '2025-05', income: 472000, yoyGrowth: 12.1, momGrowth: 5.4 },
    { period: '2025-06', income: 490000, yoyGrowth: 13.5, momGrowth: 3.8 },
    { period: '2025-07', income: 485000, yoyGrowth: 12.8, momGrowth: -1.0 },
    { period: '2025-08', income: 478000, yoyGrowth: 11.9, momGrowth: -1.4 },
    { period: '2025-09', income: 492000, yoyGrowth: 13.2, momGrowth: 2.9 },
    { period: '2025-10', income: 510000, yoyGrowth: 14.6, momGrowth: 3.7 },
    { period: '2025-11', income: 498000, yoyGrowth: 13.1, momGrowth: -2.4 },
    { period: '2025-12', income: 492000, yoyGrowth: 12.5, momGrowth: -1.2 },
  ],
  details: {
    items: [
      { project: '翡翠湾花园', month: '2025-12', receivable: 180000, collected: 172000, collectionRate: 95.6 },
      { project: '阳光城', month: '2025-12', receivable: 150000, collected: 142500, collectionRate: 95.0 },
      { project: '锦绣华庭', month: '2025-12', receivable: 120000, collected: 108000, collectionRate: 90.0 },
      { project: '翡翠湾花园', month: '2025-11', receivable: 178000, collected: 170000, collectionRate: 95.5 },
      { project: '阳光城', month: '2025-11', receivable: 148000, collected: 140600, collectionRate: 95.0 },
      { project: '锦绣华庭', month: '2025-11', receivable: 118000, collected: 106200, collectionRate: 90.0 },
      { project: '翡翠湾花园', month: '2025-10', receivable: 182000, collected: 175000, collectionRate: 96.2 },
      { project: '阳光城', month: '2025-10', receivable: 152000, collected: 145000, collectionRate: 95.4 },
      { project: '锦绣华庭', month: '2025-10', receivable: 122000, collected: 112000, collectionRate: 91.8 },
      { project: '翡翠湾花园', month: '2025-09', receivable: 176000, collected: 168000, collectionRate: 95.5 },
    ],
    total: 10,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

const collectionRateData = {
  kpis: { overallRate: 93.5, collectedTotal: 4850000, uncollectedTotal: 330000, overdueRate: 6.5 },
  chartData: [
    { project: '翡翠湾花园', rate: 95.6, receivable: 180000, collected: 172000 },
    { project: '阳光城', rate: 93.2, receivable: 150000, collected: 139800 },
    { project: '锦绣华庭', rate: 90.0, receivable: 120000, collected: 108000 },
    { project: '龙湖天街', rate: 96.1, receivable: 200000, collected: 192200 },
    { project: '万达广场', rate: 91.5, receivable: 160000, collected: 146400 },
    { project: '中海国际', rate: 94.8, receivable: 170000, collected: 161160 },
  ],
  details: {
    items: [
      { project: '翡翠湾花园', receivable: 180000, collected: 172000, collectionRate: 95.6, overdueAmount: 8000 },
      { project: '阳光城', receivable: 150000, collected: 139800, collectionRate: 93.2, overdueAmount: 10200 },
      { project: '锦绣华庭', receivable: 120000, collected: 108000, collectionRate: 90.0, overdueAmount: 12000 },
      { project: '龙湖天街', receivable: 200000, collected: 192200, collectionRate: 96.1, overdueAmount: 7800 },
      { project: '万达广场', receivable: 160000, collected: 146400, collectionRate: 91.5, overdueAmount: 13600 },
      { project: '中海国际', receivable: 170000, collected: 161160, collectionRate: 94.8, overdueAmount: 8840 },
      { project: '保利花园', receivable: 140000, collected: 130200, collectionRate: 93.0, overdueAmount: 9800 },
      { project: '绿地中心', receivable: 130000, collected: 120900, collectionRate: 93.0, overdueAmount: 9100 },
    ],
    total: 8,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

const overdueData = {
  kpis: { overdueTotal: 286500, overdueHouseholds: 42, avgOverdueDays: 35, maxOverdueAmount: 28000 },
  chartData: [
    { range: '1-30天', amount: 120000, count: 25 },
    { range: '31-60天', amount: 98000, count: 12 },
    { range: '60天以上', amount: 68500, count: 5 },
  ],
  details: {
    items: [
      { id: 'od-001', renterName: '张三', unitNumber: 'A-1-101', billNo: 'BILL-2025-001', amount: 5600, overdueDays: 15, phone: '13800138001' },
      { id: 'od-002', renterName: '李四', unitNumber: 'A-2-203', billNo: 'BILL-2025-002', amount: 8200, overdueDays: 28, phone: '13800138002' },
      { id: 'od-003', renterName: '王五', unitNumber: 'B-1-305', billNo: 'BILL-2025-003', amount: 12000, overdueDays: 45, phone: '13800138003' },
      { id: 'od-004', renterName: '赵六', unitNumber: 'B-3-102', billNo: 'BILL-2025-004', amount: 3800, overdueDays: 10, phone: '13800138004' },
      { id: 'od-005', renterName: '钱七', unitNumber: 'C-1-201', billNo: 'BILL-2025-005', amount: 28000, overdueDays: 72, phone: '13800138005' },
      { id: 'od-006', renterName: '孙八', unitNumber: 'A-3-401', billNo: 'BILL-2025-006', amount: 6500, overdueDays: 22, phone: '13800138006' },
      { id: 'od-007', renterName: '周九', unitNumber: 'C-2-303', billNo: 'BILL-2025-007', amount: 9800, overdueDays: 38, phone: '13800138007' },
      { id: 'od-008', renterName: '吴十', unitNumber: 'B-2-105', billNo: 'BILL-2025-008', amount: 4200, overdueDays: 8, phone: '13800138008' },
      { id: 'od-009', renterName: '郑十一', unitNumber: 'A-1-502', billNo: 'BILL-2025-009', amount: 15600, overdueDays: 55, phone: '13800138009' },
      { id: 'od-010', renterName: '冯十二', unitNumber: 'C-3-201', billNo: 'BILL-2025-010', amount: 7200, overdueDays: 18, phone: '13800138010' },
      { id: 'od-011', renterName: '陈十三', unitNumber: 'B-1-402', billNo: 'BILL-2025-011', amount: 11000, overdueDays: 42, phone: '13800138011' },
      { id: 'od-012', renterName: '楮十四', unitNumber: 'A-2-601', billNo: 'BILL-2025-012', amount: 6800, overdueDays: 25, phone: '13800138012' },
    ],
    total: 12,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

const repairAnalysisData = {
  kpis: { totalOrders: 328, avgProcessTime: 18.5, timeoutRate: 8.2, satisfactionRate: 92.3 },
  chartData: [
    { type: '水电', count: 98 },
    { type: '管道', count: 72 },
    { type: '门窗', count: 56 },
    { type: '电器', count: 65 },
    { type: '其他', count: 37 },
  ],
  details: {
    items: [
      { id: 'ra-001', repairNo: 'WO-2025-001', repairType: '水电', urgency: '紧急', processHours: 4.5, rating: 5, status: '已完成' },
      { id: 'ra-002', repairNo: 'WO-2025-002', repairType: '管道', urgency: '一般', processHours: 24.0, rating: 4, status: '已完成' },
      { id: 'ra-003', repairNo: 'WO-2025-003', repairType: '门窗', urgency: '低', processHours: 48.0, rating: 3, status: '已完成' },
      { id: 'ra-004', repairNo: 'WO-2025-004', repairType: '电器', urgency: '紧急', processHours: 2.0, rating: 5, status: '已完成' },
      { id: 'ra-005', repairNo: 'WO-2025-005', repairType: '水电', urgency: '一般', processHours: 12.0, rating: 4, status: '处理中' },
      { id: 'ra-006', repairNo: 'WO-2025-006', repairType: '其他', urgency: '低', processHours: 36.0, rating: 2, status: '已完成' },
      { id: 'ra-007', repairNo: 'WO-2025-007', repairType: '管道', urgency: '紧急', processHours: 6.0, rating: 5, status: '已完成' },
      { id: 'ra-008', repairNo: 'WO-2025-008', repairType: '门窗', urgency: '一般', processHours: 18.0, rating: 4, status: '已分配' },
      { id: 'ra-009', repairNo: 'WO-2025-009', repairType: '电器', urgency: '低', processHours: 72.0, rating: 1, status: '已完成' },
      { id: 'ra-010', repairNo: 'WO-2025-010', repairType: '水电', urgency: '一般', processHours: 8.5, rating: 5, status: '已完成' },
      { id: 'ra-011', repairNo: 'WO-2025-011', repairType: '管道', urgency: '紧急', processHours: 3.0, rating: 4, status: '已评价' },
      { id: 'ra-012', repairNo: 'WO-2025-012', repairType: '其他', urgency: '一般', processHours: 22.0, rating: 3, status: '已完成' },
    ],
    total: 12,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
  engineerRank: [
    { engineerName: '张工', completed: 88, avgTime: 12.3, rating: 4.8, timeoutCount: 0 },
    { engineerName: '李工', completed: 75, avgTime: 15.6, rating: 4.6, timeoutCount: 1 },
    { engineerName: '王工', completed: 62, avgTime: 18.2, rating: 4.3, timeoutCount: 2 },
    { engineerName: '赵工', completed: 58, avgTime: 22.1, rating: 4.0, timeoutCount: 3 },
    { engineerName: '钱工', completed: 45, avgTime: 28.7, rating: 3.8, timeoutCount: 5 },
  ],
};

const satisfactionData = {
  kpis: { avgRating: 4.2, fiveStarRate: 58.5, lowRatingRate: 5.8, totalRatings: 256 },
  chartData: [
    { month: '2025-01', avgRating: 4.0 },
    { month: '2025-02', avgRating: 4.1 },
    { month: '2025-03', avgRating: 3.9 },
    { month: '2025-04', avgRating: 4.2 },
    { month: '2025-05', avgRating: 4.3 },
    { month: '2025-06', avgRating: 4.1 },
    { month: '2025-07', avgRating: 4.4 },
    { month: '2025-08', avgRating: 4.2 },
    { month: '2025-09', avgRating: 4.3 },
    { month: '2025-10', avgRating: 4.5 },
    { month: '2025-11', avgRating: 4.2 },
    { month: '2025-12', avgRating: 4.3 },
  ],
  details: {
    items: [
      { id: 'sf-001', repairNo: 'WO-2025-001', renterName: '张三', rating: 5, comment: '维修师傅很专业，很快就修好了', ratedAt: '2025-12-15 14:30:00' },
      { id: 'sf-002', repairNo: 'WO-2025-002', renterName: '李四', rating: 4, comment: '处理速度可以，态度好', ratedAt: '2025-12-14 10:20:00' },
      { id: 'sf-003', repairNo: 'WO-2025-003', renterName: '王五', rating: 3, comment: '等了比较久才来', ratedAt: '2025-12-13 16:45:00' },
      { id: 'sf-004', repairNo: 'WO-2025-004', renterName: '赵六', rating: 5, comment: '非常满意', ratedAt: '2025-12-12 09:10:00' },
      { id: 'sf-005', repairNo: 'WO-2025-005', renterName: '钱七', rating: 2, comment: '修了两次才修好', ratedAt: '2025-12-11 11:00:00' },
      { id: 'sf-006', repairNo: 'WO-2025-006', renterName: '孙八', rating: 5, comment: '服务态度非常好', ratedAt: '2025-12-10 15:30:00' },
      { id: 'sf-007', repairNo: 'WO-2025-007', renterName: '周九', rating: 4, comment: '还不错', ratedAt: '2025-12-09 08:45:00' },
      { id: 'sf-008', repairNo: 'WO-2025-008', renterName: '吴十', rating: 1, comment: '态度差，效率低', ratedAt: '2025-12-08 17:20:00' },
      { id: 'sf-009', repairNo: 'WO-2025-009', renterName: '郑十一', rating: 5, comment: '速度快，质量好', ratedAt: '2025-12-07 13:15:00' },
      { id: 'sf-010', repairNo: 'WO-2025-010', renterName: '冯十二', rating: 4, comment: '比较满意', ratedAt: '2025-12-06 10:50:00' },
      { id: 'sf-011', repairNo: 'WO-2025-011', renterName: '陈十三', rating: 5, comment: '完美', ratedAt: '2025-12-05 14:00:00' },
      { id: 'sf-012', repairNo: 'WO-2025-012', renterName: '楮十四', rating: 3, comment: '一般般吧', ratedAt: '2025-12-04 09:30:00' },
    ],
    total: 12,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

export const reportHandlers = [
  http.get('/api/reports/financial/rent-income', () => {
    return HttpResponse.json(rentIncomeData);
  }),

  http.get('/api/reports/financial/collection-rate', () => {
    return HttpResponse.json(collectionRateData);
  }),

  http.get('/api/reports/financial/overdue-detail', () => {
    return HttpResponse.json(overdueData);
  }),

  http.get('/api/reports/operational/repair-analysis', () => {
    return HttpResponse.json(repairAnalysisData);
  }),

  http.get('/api/reports/operational/satisfaction', () => {
    return HttpResponse.json(satisfactionData);
  }),

  http.get('/api/reports/financial/fee-analysis', () => {
    return HttpResponse.json({
      totalIncome: 1850000,
      topFeeItem: '物业费',
      projectCount: 3,
      avgIncome: 616666,
      pieData: [
        { name: '物业费', value: 820000 },
        { name: '水费', value: 285000 },
        { name: '电费', value: 362000 },
        { name: '停车费', value: 198000 },
        { name: '维修基金', value: 185000 },
      ],
      trendData: [
        { month: '2026-01', items: { '物业费': 135000, '水费': 42000, '电费': 58000, '停车费': 33000 } },
        { month: '2026-02', items: { '物业费': 135000, '水费': 38000, '电费': 52000, '停车费': 33000 } },
        { month: '2026-03', items: { '物业费': 138000, '水费': 45000, '电费': 61000, '停车费': 33000 } },
        { month: '2026-04', items: { '物业费': 138000, '水费': 48000, '电费': 65000, '停车费': 33000 } },
        { month: '2026-05', items: { '物业费': 140000, '水费': 55000, '电费': 72000, '停车费': 33000 } },
        { month: '2026-06', items: { '物业费': 140000, '水费': 57000, '电费': 54000, '停车费': 33000 } },
      ],
      projectCompare: [
        { project: '翡翠湾花园', items: { '物业费': 380000, '水费': 125000, '电费': 165000, '停车费': 88000 } },
        { project: '阳光城', items: { '物业费': 260000, '水费': 95000, '电费': 118000, '停车费': 65000 } },
        { project: '锦绣华庭', items: { '物业费': 180000, '水费': 65000, '电费': 79000, '停车费': 45000 } },
      ],
    });
  }),
];
