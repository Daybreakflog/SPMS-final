import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('common.notFound')}
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          {t('common.backHome')}
        </Button>
      }
    />
  );
}
