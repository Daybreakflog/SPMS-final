import { useMemo } from 'react';
import { useUserStore } from '@/store/user.store';
import type { RoleCode } from '@/types/enums';

export function useHasRole(role: RoleCode): boolean {
  const roles = useUserStore((s) => s.user?.roles);
  return useMemo(() => roles?.includes(role) ?? false, [roles, role]);
}

export function useHasAnyRole(requiredRoles: RoleCode[]): boolean {
  const roles = useUserStore((s) => s.user?.roles);
  return useMemo(
    () => {
      if (!roles) return false;
      return requiredRoles.some((r) => roles.includes(r));
    },
    [roles, requiredRoles],
  );
}
