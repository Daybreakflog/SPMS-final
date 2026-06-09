export interface Complaint {
  id: string;
  complaintNo: string;
  title: string;
  description: string;
  images?: string[];
  complainantId: string;
  complainantName: string;
  targetType: string;
  targetName: string;
  severity: string;
  status: string;
  assigneeId?: string;
  assigneeName?: string;
  analysis?: ComplaintAnalysisRecord;
  appeals?: ComplaintAppeal[];
  closedReason?: string;
  submittedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintAnalysisRecord {
  conclusion: string;
  responsibility: string;
  suggestion: string;
  result: string;
  operatorId: string;
  operatorName: string;
  createdAt: string;
}

export interface ComplaintAppeal {
  id: string;
  reason: string;
  evidence?: string[];
  status: string;
  resolveOpinion?: string;
  appealerId: string;
  appealerName: string;
  resolverId?: string;
  resolverName?: string;
  createdAt: string;
  resolvedAt?: string;
}
