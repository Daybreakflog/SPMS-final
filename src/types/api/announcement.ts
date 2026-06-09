import type { PageParams } from './common';

export interface AnnouncementListParams extends PageParams {
  keyword?: string;
  status?: number;
  projectId?: string;
}

// 对应后端 CreateAnnouncementDto
// ⚠ 后端 DTO **不包含** type / scope / projectIds[] / attachment 字段
//   - 公告必须挂在某个 projectId 下，单数
//   - 创建时传 publish: true 可直接发布；否则保持草稿（publishedAt 为 null）
export interface AnnouncementCreateDTO {
  projectId: string;
  title: string;
  content: string;
  status?: number;
  publish?: boolean;
}

// 对应后端 UpdateAnnouncementDto（不允许改 projectId）
export interface AnnouncementUpdateDTO {
  title?: string;
  content?: string;
  status?: number;
  publish?: boolean;
}
