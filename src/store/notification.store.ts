import { create } from 'zustand';

interface RealtimeNotification {
  id: string;
  title: string;
  content: string;
  type: string;
  targetUrl?: string;
  createdAt: string;
}

interface NotificationState {
  unreadCount: number;
  recentMessages: RealtimeNotification[];
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
  clearAll: () => void;
  pushMessage: (msg: RealtimeNotification) => void;
}

export type { RealtimeNotification };

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  recentMessages: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  increment: () => set({ unreadCount: get().unreadCount + 1 }),

  decrement: () => {
    const current = get().unreadCount;
    set({ unreadCount: Math.max(0, current - 1) });
  },

  clearAll: () => set({ unreadCount: 0 }),

  pushMessage: (msg) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      recentMessages: [msg, ...state.recentMessages].slice(0, 5),
    })),
}));
