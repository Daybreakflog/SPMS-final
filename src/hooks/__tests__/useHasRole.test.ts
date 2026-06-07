import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHasRole, useHasAnyRole } from '../useHasRole';
import { useUserStore } from '@/store/user.store';
import { RoleCode, UserType } from '@/types/enums';

describe('useHasRole', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  it('returns false when user is null', () => {
    const { result } = renderHook(() => useHasRole(RoleCode.PLATFORM_ADMIN));
    expect(result.current).toBe(false);
  });

  it('returns true when user has the role', () => {
    useUserStore.setState({
      user: {
        id: '1',
        username: 'admin',
        realName: 'Admin',
        roles: [RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN],
        companyId: 'c1',
        companyName: 'Test Co',
        projectIds: [],
        userType: UserType.STAFF,
      },
    });

    const { result } = renderHook(() => useHasRole(RoleCode.PLATFORM_ADMIN));
    expect(result.current).toBe(true);
  });

  it('returns false when user does not have the role', () => {
    useUserStore.setState({
      user: {
        id: '1',
        username: 'admin',
        realName: 'Admin',
        roles: [RoleCode.FINANCE],
        companyId: 'c1',
        companyName: 'Test Co',
        projectIds: [],
        userType: UserType.STAFF,
      },
    });

    const { result } = renderHook(() => useHasRole(RoleCode.PLATFORM_ADMIN));
    expect(result.current).toBe(false);
  });
});

describe('useHasAnyRole', () => {
  it('returns true when user has at least one required role', () => {
    useUserStore.setState({
      user: {
        id: '1',
        username: 'admin',
        realName: 'Admin',
        roles: [RoleCode.FINANCE],
        companyId: 'c1',
        companyName: 'Test Co',
        projectIds: [],
        userType: UserType.STAFF,
      },
    });

    const { result } = renderHook(() =>
      useHasAnyRole([RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]),
    );
    expect(result.current).toBe(true);
  });

  it('returns false when user has none of the required roles', () => {
    useUserStore.setState({
      user: {
        id: '1',
        username: 'eng',
        realName: 'Eng',
        roles: [RoleCode.ENGINEER],
        companyId: 'c1',
        companyName: 'Test Co',
        projectIds: [],
        userType: UserType.STAFF,
      },
    });

    const { result } = renderHook(() =>
      useHasAnyRole([RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]),
    );
    expect(result.current).toBe(false);
  });
});
