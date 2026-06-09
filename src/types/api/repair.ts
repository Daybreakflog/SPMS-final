import type { PageParams } from './common';

export interface RepairListParams extends PageParams {
  projectId?: string;
  keyword?: string;
  status?: string;
  category?: string;
}

// 对应后端 CreateRepairOrderDto
// ⚠ 后端 DTO **不包含** unitId / urgency / title / contactName / contactPhone / preferredTime —— 这些字段传过去会被静默丢弃
export interface RepairCreateDTO {
  projectId: string;
  category: string;
  description: string;
  attachments?: string;
}

// 对应后端 UpdateRepairOrderDto
export interface RepairUpdateDTO {
  category?: string;
  description?: string;
  attachments?: string;
}

// 对应后端 AssignRepairDto
export interface RepairAssignDTO {
  assigneeId: string;
  remark?: string;
}

// 对应后端 CreateRepairProgressDto —— /progress 和 /complete 共用此 DTO
export interface RepairProgressDTO {
  content: string;
  attachments?: string;
}

/** /complete 接口复用 CreateRepairProgressDto */
export type RepairCompleteDTO = RepairProgressDTO;

// 对应后端 CreateRepairRatingDto —— 速度 + 质量两个评分
export interface RepairRatingDTO {
  speedScore: number;
  qualityScore: number;
  comment?: string;
}

// 对应后端 CreateRepairMessageDto —— 只有 content，没有 images
export interface RepairMessageDTO {
  content: string;
}
