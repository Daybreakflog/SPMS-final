import { create } from 'zustand';
import { storage } from '@/utils/storage';

const THEME_KEY = 'theme_mode';
const PRIMARY_KEY = 'theme_primary';

type ThemeMode = 'light' | 'dark';

/** 默认主色调 */
export const DEFAULT_PRIMARY = '#1677ff';

interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  setPrimaryColor: (color: string) => void;
  resetPrimaryColor: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: storage.get<ThemeMode>(THEME_KEY) ?? 'light',
  primaryColor: storage.get<string>(PRIMARY_KEY) ?? DEFAULT_PRIMARY,

  setMode: (mode) => {
    storage.set(THEME_KEY, mode);
    set({ mode });
  },

  toggle: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    storage.set(THEME_KEY, next);
    set({ mode: next });
  },

  setPrimaryColor: (color) => {
    storage.set(PRIMARY_KEY, color);
    set({ primaryColor: color });
  },

  resetPrimaryColor: () => {
    storage.set(PRIMARY_KEY, DEFAULT_PRIMARY);
    set({ primaryColor: DEFAULT_PRIMARY });
  },
}));
