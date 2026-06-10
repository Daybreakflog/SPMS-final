export enum RoleCode {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  FINANCE = 'FINANCE',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  ENGINEER = 'ENGINEER',
  OPERATIONS = 'OPERATIONS',
  TENANT = 'TENANT',
}

export enum UserType {
  STAFF = 'STAFF',
  TENANT = 'TENANT',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_FINANCE = 'PENDING_FINANCE',
  PENDING_ADMIN = 'PENDING_ADMIN',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  TERMINATED = 'TERMINATED',
}

export enum BillStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum RepairStatus {
  SUBMITTED = 'SUBMITTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RATED = 'RATED',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  ANALYZING = 'ANALYZING',
  APPEALING = 'APPEALING',
  CLOSED = 'CLOSED',
}

export enum BillingRule {
  FIXED = 'FIXED',
  BY_AREA = 'BY_AREA',
  BY_METER = 'BY_METER',
}

export enum PaymentChannel {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
  BANK = 'BANK',
}

export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
}

export enum IdType {
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  OTHER = 'OTHER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum PropertyNodeType {
  BUILDING = 'BUILDING',
  FLOOR = 'FLOOR',
  UNIT = 'UNIT',
}

export enum UnitBindStatus {
  BOUND = 'BOUND',
  UNBOUND = 'UNBOUND',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum PaymentCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum FeeItemCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

export enum PaymentOrderStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum FeeItemStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum RepairType {
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  DOOR_WINDOW = 'DOOR_WINDOW',
  APPLIANCE = 'APPLIANCE',
  OTHER = 'OTHER',
}

export enum Urgency {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// 后端 CreateComplaintDto.targetType 实际取值为 PROJECT / STAFF / EVENT
export enum ComplaintTargetType {
  PROJECT = 'PROJECT',
  STAFF = 'STAFF',
  EVENT = 'EVENT',
}

export enum AppealStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AnnouncementType {
  NOTICE = 'NOTICE',
  ACTIVITY = 'ACTIVITY',
  POLICY = 'POLICY',
}

export enum AnnouncementScope {
  ALL = 'ALL',
  PROJECT = 'PROJECT',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  REPAIR = 'REPAIR',
  BILLING = 'BILLING',
  CONTRACT = 'CONTRACT',
}

export enum ReportPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum OverdueRange {
  DAYS_1_30 = '1-30',
  DAYS_31_60 = '31-60',
  DAYS_60_PLUS = '60+',
}

export enum AuditModule {
  USER = 'USER',
  CONTRACT = 'CONTRACT',
  BILLING = 'BILLING',
  REPAIR = 'REPAIR',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  SYSTEM = 'SYSTEM',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  LOGIN = 'LOGIN',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum RatingRange {
  LOW = '1-2',
  MEDIUM = '3',
  HIGH = '4-5',
}
