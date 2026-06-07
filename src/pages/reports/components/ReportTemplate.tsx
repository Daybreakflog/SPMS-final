import { useState, type ReactNode } from 'react';
import { Card, Col, Row, Select, Button, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import EChart from '@/components/EChart';
import type { TableColumnsType } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { getMessageApi } from '@/utils/antd';
import { exportToExcel } from '@/utils/export';
import DateQuickPicker from './DateQuickPicker';

const projectOptions = [
  { value: '', label: '全部项目' },
  { value: 'project-001', label: '翡翠湾花园' },
  { value: 'project-002', label: '阳光城' },
  { value: 'project-003', label: '锦绣华庭' },
];

interface ReportTemplateProps {
  title: string;
  queryKey: string;
  queryFn: (params: Record<string, unknown>) => Promise<unknown>;
  extraFilters?: ReactNode;
  kpiCards: (kpis: Record<string, unknown>) => ReactNode;
  chartOption: (data: unknown[]) => Record<string, unknown>;
  chartHeight?: number;
  columns: TableColumnsType<Record<string, unknown>>;
  extraParams?: Record<string, unknown>;
}

export default function ReportTemplate({
  title,
  queryKey,
  queryFn,
  extraFilters,
  kpiCards,
  chartOption,
  chartHeight = 350,
  columns,
  extraParams = {},
}: ReportTemplateProps) {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
  const endDate = dateRange?.[1]?.format('YYYY-MM-DD');

  const params: Record<string, unknown> = {
    ...(projectId ? { projectId } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...extraParams,
  };

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => queryFn(params),
  });

  const reportData = data as { kpis?: Record<string, unknown>; chartData?: unknown[]; details?: { items: Record<string, unknown>[]; total: number; page: number; pageSize: number } } | undefined;

  const handleDateChange = (start: string, end: string) => {
    setDateRange([dayjs(start), dayjs(end)]);
  };

  const handleExport = () => {
    const items = reportData?.details?.items;
    if (!items || items.length === 0) {
      getMessageApi()?.warning(t('common.noData'));
      return;
    }
    exportToExcel(items, columns as { title: string; dataIndex?: string; key?: string }[], title);
    getMessageApi()?.success(t('report.exportSuccess'));
  };

  return (
    <div>
      <PageHeader
        title={title}
        extra={
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('report.exportExcel')}
          </Button>
        }
      />

      <div className="mb-4 rounded-md bg-bg-container p-4 shadow-card">
        <Row gutter={[16, 12]} align="middle">
          <Col>
            <Select
              value={projectId}
              onChange={setProjectId}
              style={{ width: 180 }}
              options={projectOptions}
              placeholder={t('report.projectFilter')}
            />
          </Col>
          <Col>
            <DateQuickPicker value={dateRange} onChange={handleDateChange} />
          </Col>
          {extraFilters && <Col>{extraFilters}</Col>}
        </Row>
      </div>

      <Spin spinning={isLoading}>
        {reportData?.kpis && (
          <div className="mb-4">
            {kpiCards(reportData.kpis)}
          </div>
        )}

        {reportData?.chartData && (
          <Card className="mb-4">
            <EChart option={chartOption(reportData.chartData)} style={{ height: chartHeight }} />
          </Card>
        )}

        <DataTable
          columns={columns}
          dataSource={reportData?.details?.items ?? []}
          total={reportData?.details?.total ?? 0}
          page={reportData?.details?.page ?? 1}
          pageSize={reportData?.details?.pageSize ?? 20}
          rowKey={(record: Record<string, unknown>) => String(record.id ?? Math.random())}
        />
      </Spin>
    </div>
  );
}
