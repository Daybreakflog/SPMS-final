// 后端 RepairOrder 响应（来自 docs-json & 实际抓包）：
//   { id, projectId, renterProfileId, orderNo, category, description,
//     attachments: string|null,
//     status: 'SUBMITTED'|'ASSIGNED'|'IN_PROGRESS'|'COMPLETED'|'RATED',
//     createdAt, updatedAt,
//     project:{id,name,code}, renterProfile:{id,name,phone},
//     assignments:[{id,repairOrderId,assigneeId,remark,createdAt,assignee:{id,realName,phone}}],
//     progresses:[{id,repairOrderId,content,attachments,createdAt}],
//     messages:[],
//     rating: {speedScore,qualityScore,comment,createdAt}|null }
//
// 后端**不返回** title / urgency / unitId / unitNumber / 工单时间线时间戳(submittedAt/assignedAt 等)；
// 「报修标题」「紧急程度」「房号」当前后端 DTO 都不存。

export interface RepairAssignment {
  id: string;
  repairOrderId: string;
  assigneeId: string;
  remark?: string | null;
  createdAt: string;
  assignee?: {
    id: string;
    realName: string;
    phone?: string;
  };
}

export interface RepairProgress {
  id: string;
  repairOrderId: string;
  content: string;
  attachments?: string | null;
  createdAt: string;
}

export interface RepairRating {
  id?: string;
  speedScore: number;
  qualityScore: number;
  comment?: string | null;
  createdAt?: string;
}

export interface RepairOrder {
  id: string;
  projectId: string;
  renterProfileId: string;
  orderNo: string;
  category: string;
  description: string;
  attachments?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; code?: string };
  renterProfile?: { id: string; name: string; phone?: string };
  assignments?: RepairAssignment[];
  progresses?: RepairProgress[];
  messages?: RepairMessage[];
  rating?: RepairRating | null;
}

export interface RepairMessage {
  id: string;
  repairOrderId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  content: string;
  createdAt: string;
}
