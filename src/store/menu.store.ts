import { create } from 'zustand';
import { storage } from '@/utils/storage';

const COLLAPSED_KEY = 'sidebar_collapsed';

interface MenuState {
  collapsed: boolean;
  openKeys: string[];
  selectedKeys: string[];
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setOpenKeys: (keys: string[]) => void;
  setSelectedKeys: (keys: string[]) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  collapsed: storage.get<boolean>(COLLAPSED_KEY) ?? false,
  openKeys: [],
  selectedKeys: [],

  toggleCollapsed: () => {
    const next = !get().collapsed;
    storage.set(COLLAPSED_KEY, next);
    set({ collapsed: next });
  },

  setCollapsed: (collapsed) => {
    storage.set(COLLAPSED_KEY, collapsed);
    set({ collapsed });
  },

  setOpenKeys: (openKeys) => set({ openKeys }),
  setSelectedKeys: (selectedKeys) => set({ selectedKeys }),
}));
