import { Badge, Card } from 'antd';
import { AlertOutlined, ToolOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

const REFRESH_MS = 30_000;

export default function DataScreenAlert() {
  const { t } = useTranslation();

  const { data: overview } = useQuery({
    queryKey: ['dashboard-alert-overview'],
    queryFn: () => dashboardService.overview(),
    refetchInterval: REFRESH_MS,
  });

  const overdue = overview?.overdueBillsCount ?? 0;
  const repairs = overview?.pendingRepairs ?? 0;
  // 后端 overview 直接给 expiringContractsCount，不再单独拉 expiringContracts 列表
  const expiringCount = overview?.expiringContractsCount ?? 0;

  return (
    <Card
      size="small"
      title={t('dashboard.alerts')}
      className="fixed bottom-6 right-6 z-50 w-60 shadow-lg"
      data-testid="data-screen-alert"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <AlertOutlined className="text-error" />
            {t('dashboard.overdueBills')}
          </span>
          <Badge count={overdue} showZero color="#ff4d4f" overflowCount={9999} />
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <ToolOutlined className="text-warning" />
            {t('dashboard.pendingRepairs')}
          </span>
          <Badge count={repairs} showZero color="#faad14" overflowCount={9999} />
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <FileTextOutlined className="text-primary" />
            {t('dashboard.expiringContracts')}
          </span>
          <Badge count={expiringCount} showZero color="#1890ff" overflowCount={9999} />
        </div>
      </div>
    </Card>
  );
}
