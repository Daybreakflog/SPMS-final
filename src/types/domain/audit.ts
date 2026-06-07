export interface AuditLog {
  id: string;
  operatorId: string;
  operatorName: string;
  module: string;
  action: string;
  targetResource: string;
  ipAddress: string;
  result: string;
  detail?: string;
  createdAt: string;
}
