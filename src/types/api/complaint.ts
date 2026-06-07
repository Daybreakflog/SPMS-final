import type { PageParams } from './common';

export interface ComplaintListParams extends PageParams {
  keyword?: string;
  status?: string;
  targetType?: string;
  severity?: string;
}

export interface ComplaintAnalysisDTO {
  conclusion: string;
  responsibility: string;
  suggestion: string;
  result: string;
}

export interface ComplaintAppealDTO {
  reason: string;
  evidence?: string[];
}

export interface ComplaintAppealResolveDTO {
  accepted: boolean;
  opinion: string;
}

export interface ComplaintCloseDTO {
  reason: string;
  followUp: boolean;
}
