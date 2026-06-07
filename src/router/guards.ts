import { redirect } from 'react-router-dom';
import { getAccessToken } from '@/api/token';
import { useUserStore } from '@/store/user.store';
import type { RoleCode } from '@/types/enums';

export function authLoader() {
  const token = getAccessToken();
  if (!token) {
    return redirect('/login');
  }
  const user = useUserStore.getState().user;
  if (!user) {
    return redirect('/login');
  }
  return null;
}

export function guestLoader() {
  const token = getAccessToken();
  const user = useUserStore.getState().user;
  if (token && user) {
    return redirect('/dashboard');
  }
  return null;
}

export function roleLoader(requiredRoles: RoleCode[]) {
  return ({ request }: { request: Request }) => {
    const user = useUserStore.getState().user;
    if (!user) return redirect('/login');
    if (requiredRoles.length === 0) return null;
    const hasRole = requiredRoles.some((r) => user.roles.includes(r));
    if (!hasRole) {
      const url = new URL(request.url);
      return redirect(`/403?from=${encodeURIComponent(url.pathname)}`);
    }
    return null;
  };
}
