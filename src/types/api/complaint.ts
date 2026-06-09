import type { PageParams } from './common';

export interface ComplaintListParams extends PageParams {
  projectId?: string;
  keyword?: string;
  status?: string;
  targetType?: string;
}

// 对应后端 CreateComplaintDto
export interface ComplaintCreateDTO {
  projectId: string;
  targetType: 'PROJECT' | 'STAFF' | 'EVENT';
  targetId?: string;
  targetName?: string;
  title: string;
  content: string;
}

// 对应后端 CreateComplaintAnalysisDto
export interface ComplaintAnalysisDTO {
  conclusion: string;
  evaluation?: string;
  verified?: boolean;
}

// 对应后端 CreateComplaintAppealDto —— 只有 content 字段
export interface ComplaintAppealDTO {
  content: string;
}

// 对应后端 ResolveComplaintAppealDto
export interface ComplaintAppealResolveDTO {
  result: string;
  status?: 'ACCEPTED' | 'REJECTED';
}

// 对应后端 CloseComplaintDto —— 只有 remark 字段
export interface ComplaintCloseDTO {
  remark?: string;
}
