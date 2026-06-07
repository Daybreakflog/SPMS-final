export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  targetUrl?: string;
  senderId?: string;
  senderName?: string;
  createdAt: string;
}
