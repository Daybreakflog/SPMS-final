import { create } from 'zustand';
import type { AuthUser } from '@/types';
import type { RoleCode } from '@/types/enums';
import { storage } from '@/utils/storage';
import { normalizeRoles } from '@/services/user.service';

const USER_STORAGE_KEY = 'current_user';

function normalizeStoredUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;
  return { ...user, roles: normalizeRoles(user.roles as unknown[]) as RoleCode[] };
}

interface UserState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  hasRole: (role: RoleCode) => boolean;
  hasAnyRole: (roles: RoleCode[]) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: normalizeStoredUser(storage.get<AuthUser>(USER_STORAGE_KEY)),

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
