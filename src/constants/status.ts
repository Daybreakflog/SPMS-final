import { ContractStatus, BillStatus, RepairStatus, ComplaintStatus, BillingRule, LeaseStatus, IdType, Gender, UnitBindStatus, AccountStatus, PaymentCycle, FeeItemCycle, PaymentChannel, PaymentOrderStatus, FeeItemStatus, RepairType, Urgency, ComplaintTargetType, AppealStatus, AnnouncementStatus, AnnouncementType, AnnouncementScope, NotificationType, ReportPeriod, OverdueRange, AuditModule, AuditAction, AuditResult, RatingRange } from '@/types/enums';
import { RoleCode } from '@/types/enums';
import i18n from '@/locales/i18n';

interface StatusMeta {
  labelKey: string;
  color: string;
}

export function getStatusLabel(key: string): string {
  return i18n.t(key);
}

function meta(labelKey: string, color: string): StatusMeta {
  return { labelKey, color };
}

export const ContractStatusMeta: Record<ContractStatus, StatusMeta> = {
  [ContractStatus.DRAFT]: meta('status.contract.draft', 'default'),
  [ContractStatus.PENDING_FINANCE]: meta('status.contract.pendingFinance', 'gold'),
  [ContractStatus.PENDING_ADMIN]: meta('status.contract.pendingAdmin', 'blue'),
  [ContractStatus.ACTIVE]: meta('status.contract.active', 'green'),
  [ContractStatus.REJECTED]: meta('status.contract.rejected', 'red'),
  [ContractStatus.TERMINATED]: meta('status.contract.terminated', 'default'),
};

export const BillStatusMeta: Record<BillStatus, StatusMeta> = {
  [BillStatus.UNPAID]: meta('status.bill.unpaid', 'default'),
  [BillStatus.PARTIAL]: meta('status.bill.partial', 'gold'),
  [BillStatus.PAID]: meta('status.bill.paid', 'green'),
  [BillStatus.OVERDUE]: meta('status.bill.overdue', 'red'),
};

export const RepairStatusMeta: Record<RepairStatus, StatusMeta> = {
  [RepairStatus.SUBMITTED]: meta('status.repair.submitted', 'default'),
  [RepairStatus.ASSIGNED]: meta('status.repair.assigned', 'blue'),
  [RepairStatus.IN_PROGRESS]: meta('status.repair.inProgress', 'processing'),
  [RepairStatus.COMPLETED]: meta('status.repair.completed', 'green'),
  [RepairStatus.RATED]: meta('status.repair.rated', 'green'),
  [RepairStatus.CLOSED]: meta('status.repair.closed', 'default'),
};

export const ComplaintStatusMeta: Record<ComplaintStatus, StatusMeta> = {
  [ComplaintStatus.SUBMITTED]: meta('status.complaint.submitted', 'default'),
  [ComplaintStatus.ANALYZING]: meta('status.complaint.analyzing', 'blue'),
  [ComplaintStatus.APPEALING]: meta('status.complaint.appealing', 'gold'),
  [ComplaintStatus.CLOSED]: meta('status.complaint.closed', 'green'),
};

export const BillingRuleLabelKeys: Record<BillingRule, string> = {
  [BillingRule.FIXED]: 'status.billingRule.fixed',
  [BillingRule.BY_AREA]: 'status.billingRule.byArea',
  [BillingRule.BY_METER]: 'status.billingRule.byMeter',
};

export const LeaseStatusMeta: Record<LeaseStatus, StatusMeta> = {
  [LeaseStatus.ACTIVE]: meta('status.lease.active', 'green'),
  [LeaseStatus.CHECKED_OUT]: meta('status.lease.checkedOut', 'default'),
};

export const IdTypeLabelKeys: Record<IdType, string> = {
  [IdType.ID_CARD]: 'status.idType.idCard',
  [IdType.PASSPORT]: 'status.idType.passport',
  [IdType.OTHER]: 'status.idType.other',
};

export const GenderLabelKeys: Record<Gender, string> = {
  [Gender.MALE]: 'status.gender.male',
  [Gender.FEMALE]: 'status.gender.female',
};

export const UnitBindStatusMeta: Record<UnitBindStatus, StatusMeta> = {
  [UnitBindStatus.BOUND]: meta('status.unitBind.bound', 'green'),
  [UnitBindStatus.UNBOUND]: meta('status.unitBind.unbound', 'default'),
};

export const AccountStatusMeta: Record<AccountStatus, StatusMeta> = {
  [AccountStatus.ACTIVE]: meta('status.account.active', 'green'),
  [AccountStatus.DISABLED]: meta('status.account.disabled', 'default'),
};

export const PaymentCycleLabelKeys: Record<PaymentCycle, string> = {
  [PaymentCycle.MONTHLY]: 'status.paymentCycle.monthly',
  [PaymentCycle.QUARTERLY]: 'status.paymentCycle.quarterly',
  [PaymentCycle.YEARLY]: 'status.paymentCycle.yearly',
};

export type ContractAction = 'edit' | 'submit' | 'financeApprove' | 'financeReject' | 'adminSign' | 'adminReject' | 'renew' | 'terminate' | 'delete';

export const ContractActionMatrix: Record<ContractStatus, ContractAction[]> = {
  [ContractStatus.DRAFT]: ['edit', 'submit', 'delete'],
  [ContractStatus.PENDING_FINANCE]: ['financeApprove', 'financeReject'],
  [ContractStatus.PENDING_ADMIN]: ['adminSign', 'adminReject'],
  [ContractStatus.ACTIVE]: ['renew', 'terminate'],
  [ContractStatus.REJECTED]: [],
  [ContractStatus.TERMINATED]: [],
};

// ===== Contract action role matrix =====
// 设计原则（来自审计 H-03）：
//   1. ENGINEER / TENANT 全部不允许操作合同；
//   2. CUSTOMER_SERVICE 仅可起草、提交、续签（不能删除已生效合同；删除全部交由管理员）；
//   3. FINANCE 仅参与财务审批环节；
//   4. terminate 视为终止已生效合同，必须由公司或平台管理员执行，PROJECT_ADMIN 不参与终止。
export const ContractActionRoles: Record<ContractAction, RoleCode[]> = {
  edit: [RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  submit: [RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  financeApprove: [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN],
  financeReject: [RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN],
  adminSign: [RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.PLATFORM_ADMIN],
  adminReject: [RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.PLATFORM_ADMIN],
  renew: [RoleCode.CUSTOMER_SERVICE, RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
  // 终止已生效合同：仅平台 / 公司管理员
  terminate: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
  // 删除：仅管理员（草稿 / 已驳回阶段；ContractActionMatrix 已禁止在 ACTIVE 状态下出现 delete）
  delete: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN],
};

export const PaymentChannelLabelKeys: Record<PaymentChannel, string> = {
  [PaymentChannel.WECHAT]: 'status.paymentChannel.wechat',
  [PaymentChannel.ALIPAY]: 'status.paymentChannel.alipay',
  [PaymentChannel.BANK]: 'status.paymentChannel.bank',
};

export const FeeItemCycleLabelKeys: Record<FeeItemCycle, string> = {
  [FeeItemCycle.MONTHLY]: 'status.feeItemCycle.monthly',
  [FeeItemCycle.QUARTERLY]: 'status.feeItemCycle.quarterly',
  [FeeItemCycle.YEARLY]: 'status.feeItemCycle.yearly',
  [FeeItemCycle.ONE_TIME]: 'status.feeItemCycle.oneTime',
};

export const PaymentOrderStatusMeta: Record<PaymentOrderStatus, StatusMeta> = {
  [PaymentOrderStatus.PENDING]: meta('status.paymentOrder.pending', 'gold'),
  [PaymentOrderStatus.SUCCESS]: meta('status.paymentOrder.success', 'green'),
  [PaymentOrderStatus.FAILED]: meta('status.paymentOrder.failed', 'red'),
};

export const FeeItemStatusMeta: Record<FeeItemStatus, StatusMeta> = {
  [FeeItemStatus.ACTIVE]: meta('status.feeItem.active', 'green'),
  [FeeItemStatus.DISABLED]: meta('status.feeItem.disabled', 'default'),
};

export const BillingRuleUnitKeys: Record<BillingRule, string> = {
  [BillingRule.FIXED]: 'status.billingRuleUnit.fixed',
  [BillingRule.BY_AREA]: 'status.billingRuleUnit.byArea',
  [BillingRule.BY_METER]: 'status.billingRuleUnit.byMeter',
};

// ===== Repair =====
export const RepairTypeLabelKeys: Record<RepairType, string> = {
  [RepairType.ELECTRICAL]: 'status.repairType.electrical',
  [RepairType.PLUMBING]: 'status.repairType.plumbing',
  [RepairType.DOOR_WINDOW]: 'status.repairType.doorWindow',
  [RepairType.APPLIANCE]: 'status.repairType.appliance',
  [RepairType.OTHER]: 'status.repairType.other',
};

export const UrgencyLabelKeys: Record<Urgency, string> = {
  [Urgency.HIGH]: 'status.urgency.high',
  [Urgency.MEDIUM]: 'status.urgency.medium',
  [Urgency.LOW]: 'status.urgency.low',
};

export const UrgencyColors: Record<Urgency, string> = {
  [Urgency.HIGH]: 'red',
  [Urgency.MEDIUM]: 'gold',
  [Urgency.LOW]: 'default',
};

export const ComplaintTargetTypeLabelKeys: Record<ComplaintTargetType, string> = {
  [ComplaintTargetType.PROJECT]: 'status.complaintTarget.project',
  [ComplaintTargetType.STAFF]: 'status.complaintTarget.staff',
  [ComplaintTargetType.EVENT]: 'status.complaintTarget.event',
};

export const AppealStatusMeta: Record<AppealStatus, StatusMeta> = {
  [AppealStatus.PENDING]: meta('status.appeal.pending', 'gold'),
  [AppealStatus.ACCEPTED]: meta('status.appeal.accepted', 'green'),
  [AppealStatus.REJECTED]: meta('status.appeal.rejected', 'red'),
};

export const SeverityLabelKeys: Record<string, string> = {
  HIGH: 'status.severity.high',
  MEDIUM: 'status.severity.medium',
  LOW: 'status.severity.low',
};

export const SeverityColors: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'gold',
  LOW: 'default',
};

export const RepairStatusTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: RepairStatus.SUBMITTED, labelKey: 'status.repair.submitted' },
  { key: RepairStatus.ASSIGNED, labelKey: 'status.repair.assigned' },
  { key: RepairStatus.IN_PROGRESS, labelKey: 'status.repair.inProgress' },
  { key: RepairStatus.COMPLETED, labelKey: 'status.repair.completed' },
  { key: RepairStatus.RATED, labelKey: 'status.repair.rated' },
];

export const ComplaintStatusTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: ComplaintStatus.SUBMITTED, labelKey: 'status.complaint.submitted' },
  { key: ComplaintStatus.ANALYZING, labelKey: 'status.complaint.analyzing' },
  { key: ComplaintStatus.APPEALING, labelKey: 'status.complaint.appealing' },
  { key: ComplaintStatus.CLOSED, labelKey: 'status.complaint.closed' },
];

// ===== Repair action matrix =====
export type RepairAction = 'assign' | 'progress' | 'complete';

export const RepairActionMatrix: Record<RepairStatus, RepairAction[]> = {
  [RepairStatus.SUBMITTED]: ['assign'],
  [RepairStatus.ASSIGNED]: ['assign', 'progress', 'complete'],
  [RepairStatus.IN_PROGRESS]: ['progress', 'complete'],
  [RepairStatus.COMPLETED]: [],
  [RepairStatus.RATED]: [],
  [RepairStatus.CLOSED]: [],
};

export const RepairActionRoles: Record<RepairAction, RoleCode[]> = {
  assign: [RoleCode.CUSTOMER_SERVICE, RoleCode.PROJECT_ADMIN, RoleCode.PLATFORM_ADMIN],
  progress: [RoleCode.ENGINEER],
  complete: [RoleCode.ENGINEER],
};

// ===== Complaint action matrix =====
export type ComplaintAction = 'analyze' | 'appeal' | 'resolveAppeal' | 'close';

export const ComplaintActionMatrix: Record<ComplaintStatus, ComplaintAction[]> = {
  [ComplaintStatus.SUBMITTED]: ['analyze'],
  [ComplaintStatus.ANALYZING]: ['appeal', 'close'],
  [ComplaintStatus.APPEALING]: ['resolveAppeal', 'close'],
  [ComplaintStatus.CLOSED]: [],
};

export const ComplaintActionRoles: Record<ComplaintAction, RoleCode[]> = {
  analyze: [RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN],
  appeal: [RoleCode.ENGINEER, RoleCode.CUSTOMER_SERVICE],
  resolveAppeal: [RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN],
  close: [RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN],
};

// ===== Announcement =====
export const AnnouncementStatusMeta: Record<AnnouncementStatus, StatusMeta> = {
  [AnnouncementStatus.DRAFT]: meta('status.announcement.draft', 'default'),
  [AnnouncementStatus.PUBLISHED]: meta('status.announcement.published', 'green'),
  [AnnouncementStatus.ARCHIVED]: meta('status.announcement.archived', 'default'),
};

export const AnnouncementStatusTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: AnnouncementStatus.DRAFT, labelKey: 'status.announcement.draft' },
  { key: AnnouncementStatus.PUBLISHED, labelKey: 'status.announcement.published' },
  { key: AnnouncementStatus.ARCHIVED, labelKey: 'status.announcement.archived' },
];

export const AnnouncementTypeLabelKeys: Record<AnnouncementType, string> = {
  [AnnouncementType.NOTICE]: 'status.announcementType.notice',
  [AnnouncementType.ACTIVITY]: 'status.announcementType.activity',
  [AnnouncementType.POLICY]: 'status.announcementType.policy',
};

export const AnnouncementScopeLabelKeys: Record<AnnouncementScope, string> = {
  [AnnouncementScope.ALL]: 'status.announcementScope.all',
  [AnnouncementScope.PROJECT]: 'status.announcementScope.project',
};

// ===== Notification =====
export const NotificationTypeLabelKeys: Record<NotificationType, string> = {
  [NotificationType.SYSTEM]: 'status.notificationType.system',
  [NotificationType.REPAIR]: 'status.notificationType.repair',
  [NotificationType.BILLING]: 'status.notificationType.billing',
  [NotificationType.CONTRACT]: 'status.notificationType.contract',
};

export const NotificationTypeTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: NotificationType.SYSTEM, labelKey: 'status.notificationType.system' },
  { key: NotificationType.REPAIR, labelKey: 'status.notificationType.repair' },
  { key: NotificationType.BILLING, labelKey: 'status.notificationType.billing' },
  { key: NotificationType.CONTRACT, labelKey: 'status.notificationType.contract' },
];

export const BillStatusTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: BillStatus.UNPAID, labelKey: 'status.bill.unpaid' },
  { key: BillStatus.PARTIAL, labelKey: 'status.bill.partial' },
  { key: BillStatus.PAID, labelKey: 'status.bill.paid' },
  { key: BillStatus.OVERDUE, labelKey: 'status.bill.overdue' },
];

export const ContractStatusTabKeys = [
  { key: '', labelKey: 'common.all' },
  { key: ContractStatus.DRAFT, labelKey: 'status.contract.draft' },
  { key: ContractStatus.PENDING_FINANCE, labelKey: 'status.contract.pendingFinance' },
  { key: ContractStatus.PENDING_ADMIN, labelKey: 'status.contract.pendingAdmin' },
  { key: ContractStatus.ACTIVE, labelKey: 'status.contract.active' },
  { key: ContractStatus.REJECTED, labelKey: 'status.contract.rejected' },
  { key: ContractStatus.TERMINATED, labelKey: 'status.contract.terminated' },
];

// ===== Report =====
export const ReportPeriodLabelKeys: Record<ReportPeriod, string> = {
  [ReportPeriod.MONTHLY]: 'status.reportPeriod.monthly',
  [ReportPeriod.QUARTERLY]: 'status.reportPeriod.quarterly',
  [ReportPeriod.YEARLY]: 'status.reportPeriod.yearly',
};

export const OverdueRangeLabelKeys: Record<OverdueRange, string> = {
  [OverdueRange.DAYS_1_30]: 'status.overdueRange.days1_30',
  [OverdueRange.DAYS_31_60]: 'status.overdueRange.days31_60',
  [OverdueRange.DAYS_60_PLUS]: 'status.overdueRange.days60Plus',
};

export const RatingRangeLabelKeys: Record<RatingRange, string> = {
  [RatingRange.LOW]: 'status.ratingRange.low',
  [RatingRange.MEDIUM]: 'status.ratingRange.medium',
  [RatingRange.HIGH]: 'status.ratingRange.high',
};

export const DateQuickOptionKeys = [
  { labelKey: 'report.thisMonth', value: 'thisMonth' },
  { labelKey: 'report.lastMonth', value: 'lastMonth' },
  { labelKey: 'report.thisQuarter', value: 'thisQuarter' },
  { labelKey: 'report.thisYear', value: 'thisYear' },
];

// ===== Audit =====
export const AuditModuleLabelKeys: Record<AuditModule, string> = {
  [AuditModule.USER]: 'status.auditModule.user',
  [AuditModule.CONTRACT]: 'status.auditModule.contract',
  [AuditModule.BILLING]: 'status.auditModule.billing',
  [AuditModule.REPAIR]: 'status.auditModule.repair',
  [AuditModule.ANNOUNCEMENT]: 'status.auditModule.announcement',
  [AuditModule.SYSTEM]: 'status.auditModule.system',
};

export const AuditActionLabelKeys: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'status.auditAction.create',
  [AuditAction.UPDATE]: 'status.auditAction.update',
  [AuditAction.DELETE]: 'status.auditAction.delete',
  [AuditAction.APPROVE]: 'status.auditAction.approve',
  [AuditAction.LOGIN]: 'status.auditAction.login',
};

export const AuditResultMeta: Record<AuditResult, StatusMeta> = {
  [AuditResult.SUCCESS]: meta('status.auditResult.success', 'green'),
  [AuditResult.FAILURE]: meta('status.auditResult.failure', 'red'),
};
