import type { ReactNode, ReactElement } from 'react';
import { cloneElement, isValidElement, Children } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/store/user.store';
import type { RoleCode } from '@/types/enums';

interface PermissionGuardProps {
  roles: RoleCode[];
  children: ReactNode;
  fallback?: ReactNode;
  /** When true, shows children as disabled with tooltip instead of hiding */
  disableOnly?: boolean;
}

export default function PermissionGuard({ roles, children, fallback = null, disableOnly = false }: PermissionGuardProps) {
  const { t } = useTranslation();
  const userRoles = useUserStore((s) => s.user?.roles);

  if (!userRoles) return fallback;
  if (roles.length === 0) return children;

  const hasPermission = roles.some((r) => userRoles.includes(r));

  if (hasPermission) return children;

  if (disableOnly) {
    return (
      <>
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            return (
              <Tooltip title={t('common.noPermission')}>
                {cloneElement(child as ReactElement<{ disabled?: boolean }>, { disabled: true })}
              </Tooltip>
            );
          }
          return child;
        })}
      </>
    );
  }

  return fallback;
}
