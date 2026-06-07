import { Button, Result, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  return (
    <Result
      status="403"
      title="403"
      subTitle={t('common.noPermission')}
      extra={
        <div className="flex flex-col items-center gap-3">
          {from && (
            <Paragraph type="secondary" className="text-center">
              {t('common.noPermission403')}: {from}
            </Paragraph>
          )}
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            {t('common.backHome')}
          </Button>
        </div>
      }
    />
  );
}
