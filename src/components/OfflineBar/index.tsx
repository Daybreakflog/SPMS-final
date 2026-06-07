import { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { WifiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export default function OfflineBar() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      queryClient.invalidateQueries();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [queryClient]);

  if (online) return null;

  return (
    <Alert
      message={t('common.offline')}
      type="warning"
      banner
      showIcon
      icon={<WifiOutlined />}
      className="sticky top-0 z-50"
    />
  );
}
