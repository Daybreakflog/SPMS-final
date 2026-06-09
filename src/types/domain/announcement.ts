// 后端 Announcement 响应（来自 docs-json & 实际抓包）：
//   { id, projectId, title, content, status:number, publishedAt|null,
//     createdAt, updatedAt, project:{id,name} }
export interface Announcement {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}
