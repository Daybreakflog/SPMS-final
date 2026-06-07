import type { PageParams } from './common';

export interface AnnouncementListParams extends PageParams {
  keyword?: string;
  status?: string;
  type?: string;
}

export interface AnnouncementCreateDTO {
  title: string;
  type: string;
  scope: string;
  projectIds?: string[];
  content: string;
  attachment?: string;
}

export type AnnouncementUpdateDTO = Partial<AnnouncementCreateDTO>;
