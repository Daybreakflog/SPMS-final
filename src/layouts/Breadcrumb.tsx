import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RouteHandle {
  title?: string;
  i18nKey?: string;
}

export default function Breadcrumb() {
  const matches = useMatches();
  const { t } = useTranslation();

  const items = matches
    .filter((m) => {
      const handle = m.handle as RouteHandle | undefined;
      return handle?.title || handle?.i18nKey;
    })
    .map((m) => {
      const handle = m.handle as RouteHandle;
      const label = handle.i18nKey ? t(handle.i18nKey) : handle.title ?? '';
      return {
        key: m.id,
        title: m.pathname === matches[matches.length - 1].pathname
          ? label
          : <Link to={m.pathname}>{label}</Link>,
      };
    });

  if (items.length === 0) return null;

  return (
    <AntBreadcrumb
      className="mb-4"
      items={items}
    />
  );
}
