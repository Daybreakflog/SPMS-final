import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  trend?: number;
  suffix?: string;
  prefix?: ReactNode;
  icon?: ReactNode;
  precision?: number;
  onClick?: () => void;
}

export default function KpiCard({ title, value, trend, suffix, prefix, icon, precision, onClick }: KpiCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={onClick ? 'cursor-pointer' : ''}
      onClick={onClick}
    >
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix || icon}
        precision={precision}
      />
      {trend !== undefined && (
        <div
          className="mt-2 flex items-center gap-1 text-xs"
          style={{ color: trend >= 0 ? '#52c41a' : '#ff4d4f' }}
        >
          {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
          <span className="text-text-tertiary">{t('dashboard.mom')}</span>
        </div>
      )}
    </Card>
  );
}
