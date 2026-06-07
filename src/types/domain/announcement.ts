export interface Announcement {
  id: string;
  title: string;
  type: string;
  scope: string;
  projectIds?: string[];
  projectNames?: string[];
  content: string;
  attachment?: string;
  status: string;
  publisherId?: string;
  publisherName?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
