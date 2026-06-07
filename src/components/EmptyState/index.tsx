import { Empty, Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type EmptyType = 'empty' | 'noPermission' | 'error';

interface EmptyStateProps {
  type?: EmptyType;
  description?: string;
}

export default function EmptyState({ type = 'empty', description }: EmptyStateProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (type === 'noPermission') {
    return (
      <Result
        status="403"
        title="403"
        subTitle={description ?? t('common.noPermission403')}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            {t('common.backHome')}
          </Button>
        }
      />
    );
  }

  if (type === 'error') {
    return (
      <Result
        status="500"
        title={t('common.errorTitle')}
        subTitle={description ?? t('common.serverError')}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            {t('error.retry')}
          </Button>
        }
      />
    );
  }

  return <Empty description={description ?? t('common.noData')} />;
}
