import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';

interface StatusMeta {
  labelKey: string;
  color: string;
}

interface StatusTagProps<T extends string> {
  status: T;
  statusMap: Record<T, StatusMeta>;
}

export default function StatusTag<T extends string>({ status, statusMap }: StatusTagProps<T>) {
  const { t } = useTranslation();
  const meta = statusMap[status];
  if (!meta) return <Tag>{status}</Tag>;
  return <Tag color={meta.color}>{t(meta.labelKey)}</Tag>;
}
