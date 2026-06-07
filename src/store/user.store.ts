import { create } from 'zustand';
import type { AuthUser } from '@/types';
import type { RoleCode } from '@/types/enums';
import { storage } from '@/utils/storage';

const USER_STORAGE_KEY = 'current_user';

interface UserState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  hasRole: (role: RoleCode) => boolean;
  hasAnyRole: (roles: RoleCode[]) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: storage.get<AuthUser>(USER_STORAGE_KEY),

  setUser: (user) => {
    storage.set(USER_STORAGE_KEY, user);
    set({ user });
  },

  clearUser: () => {
    storage.remove(USER_STORAGE_KEY);
    set({ user: null });
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.roles.includes(role) ?? false;
  },

  hasAnyRole: (roles) => {
    const { user } = get();
    if (!user) return false;
    return roles.some((r) => user.roles.includes(r));
  },
}));
