import type { ReactNode } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  extra?: ReactNode;
}

export default function PageHeader({ title, subtitle, showBack = false, extra }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          />
        )}
        <div>
          <h2 className="m-0 text-lg font-semibold">{title}</h2>
          {subtitle && <p className="m-0 text-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
}
