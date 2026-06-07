import { useState } from 'react';
import { Card, Col, Row, Select, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { reportService } from '@/services/report.service';
import { OverdueRangeLabelKeys } from '@/constants/status';
import ReportTemplate from '../components/ReportTemplate';
import type { OverdueKpi, OverdueChart } from '@/types';

export default function OverduePage() {
  const { t } = useTranslation();
  const [overdueRange, setOverdueRange] = useState<string>('');

  const rangeOptions = Object.entries(OverdueRangeLabelKeys).map(([value, key]) => ({ value, label: t(key) }));

  const columns: TableColumnsType<Record<string, unknown>> = [
    { title: t('report.renter'), dataIndex: 'renterName', width: 100 },
    { title: t('report.unitNumber'), dataIndex: 'unitNumber', width: 120 },
    { title: t('report.billNo'), dataIndex: 'billNo', width: 160 },
    { title: t('report.amount'), dataIndex: 'amount', width: 120, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: t('report.overdueDays'), dataIndex: 'overdueDays', width: 100, render: (v: number) => `${v}天` },
    { title: t('report.phone'), dataIndex: 'phone', width: 140 },
  ];

  const kpiCards = (kpis: Record<string, unknown>) => {
    const d = kpis as unknown as OverdueKpi;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.overdueTotal')} value={d.overdueTotal} prefix="¥" precision={0} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.overdueHouseholds')} value={d.overdueHouseholds} suffix="户" /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.avgOverdueDays')} value={d.avgOverdueDays} suffix="天" /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.maxOverdueAmount')} value={d.maxOverdueAmount} prefix="¥" precision={0} /></Card>
        </Col>
      </Row>
    );
  };

  const chartOption = (data: unknown[]) => {
    const chartData = data as OverdueChart[];
    return {
      tooltip: { trigger: 'item' as const },
      legend: { orient: 'vertical' as const, left: 'left' },
      series: [
        {
          type: 'pie' as const,
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: true, formatter: '{b}: ¥{c}' },
          data: chartData.map((d) => ({ name: d.range, value: d.amount })),
        },
      ],
    };
  };

  return (
    <ReportTemplate
      title={t('report.overdueTitle')}
      queryKey="report-overdue"
      queryFn={(params) => reportService.overdueDetail(params)}
      extraFilters={
        <Select
          value={overdueRange}
          onChange={setOverdueRange}
          style={{ width: 140 }}
          allowClear
          placeholder={t('report.overdueRange')}
          options={[{ value: '', label: t('common.all') }, ...rangeOptions]}
        />
      }
      extraParams={overdueRange ? { overdueRange } : {}}
      kpiCards={kpiCards}
      chartOption={chartOption}
      columns={columns}
    />
  );
}
