import type { PageParams } from './common';

export interface RepairListParams extends PageParams {
  keyword?: string;
  status?: string;
  repairType?: string;
  urgency?: string;
  engineerId?: string;
}

export interface RepairAssignDTO {
  engineerId: string;
  engineerName?: string;
  remark?: string;
}

export interface RepairProgressDTO {
  description: string;
  images?: string[];
}

export interface RepairCompleteDTO {
  summary: string;
  images?: string[];
}

export interface RepairRatingDTO {
  score: number;
  comment?: string;
}

export interface RepairMessageDTO {
  content: string;
  images?: string[];
}
