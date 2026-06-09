import { useState } from 'react';
import { Card, Col, Row, Select, Statistic, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { reportService } from '@/services/report.service';
import { ReportPeriodLabelKeys } from '@/constants/status';
import ReportTemplate from '../components/ReportTemplate';
import type { RentIncomeKpi, RentIncomeChart } from '@/types';

type TrendMode = 'actual' | 'yoy' | 'mom';

export default function RentIncomePage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>('');
  const [trendMode, setTrendMode] = useState<TrendMode>('actual');

  const periodOptions = Object.entries(ReportPeriodLabelKeys).map(([value, key]) => ({ value, label: t(key) }));

  const columns: TableColumnsType<Record<string, unknown>> = [
    { title: t('report.project'), dataIndex: 'project', width: 150 },
    { title: t('report.month'), dataIndex: 'month', width: 120 },
    { title: t('report.receivable'), dataIndex: 'receivable', width: 130, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: t('report.collected'), dataIndex: 'collected', width: 130, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: t('report.collectionRate'), dataIndex: 'collectionRate', width: 110, render: (v: number) => `${v}%` },
  ];

  const kpiCards = (kpis: Record<string, unknown>) => {
    const d = kpis as unknown as RentIncomeKpi;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.totalIncome')} value={d.totalIncome} prefix="¥" precision={0} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.yoyGrowth')} value={d.yoyGrowth} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.momGrowth')} value={d.momGrowth} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.avgUnitPrice')} value={d.avgUnitPrice} prefix="¥" suffix="/㎡" precision={1} /></Card>
        </Col>
      </Row>
    );
  };

  const trendModeOptions = [
    { value: 'actual', label: t('report.trendActual') },
    { value: 'yoy', label: t('report.trendYoy') },
    { value: 'mom', label: t('report.trendMom') },
  ];

  const chartOption = (data: unknown[]) => {
    const chartData = data as RentIncomeChart[];
    const seriesConfig = {
      actual: { key: 'income' as keyof RentIncomeChart, name: t('report.incomeTrend'), color: '#1890ff' },
      yoy: { key: 'yoyGrowth' as keyof RentIncomeChart, name: t('report.trendYoy'), color: '#52c41a' },
      mom: { key: 'momGrowth' as keyof RentIncomeChart, name: t('report.trendMom'), color: '#faad14' },
    };
    const cfg = seriesConfig[trendMode];
    const seriesList = [
      {
        name: cfg.name,
        type: 'line' as const,
        data: chartData.map((d) => d[cfg.key] ?? 0),
        smooth: true,
        itemStyle: { color: cfg.color },
        areaStyle: { opacity: 0.1 },
      },
    ];
    // If actual mode, also overlay yoy/mom lines as reference
    if (trendMode === 'actual') {
      seriesList.push(
        {
          name: t('report.trendYoy'),
          type: 'line' as const,
          data: chartData.map((d) => d.yoyGrowth ?? 0),
          smooth: true,
          itemStyle: { color: '#52c41a' },
          areaStyle: { opacity: 0 },
        },
        {
          name: t('report.trendMom'),
          type: 'line' as const,
          data: chartData.map((d) => d.momGrowth ?? 0),
          smooth: true,
          itemStyle: { color: '#faad14' },
          areaStyle: { opacity: 0 },
        },
      );
    }
    return {
      tooltip: { trigger: 'axis' as const },
      legend: {
        data: seriesList.map((s) => s.name),
        bottom: 0,
        type: 'scroll' as const,
        itemGap: 24,
      },
      grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: { type: 'category' as const, data: chartData.map((d) => d.period) },
      yAxis: trendMode === 'actual'
        ? [{ type: 'value' as const, name: t('report.amount') }, { type: 'value' as const, name: '%', axisLabel: { formatter: '{value}%' } }]
        : { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
      series: seriesList,
    };
  };

  return (
    <ReportTemplate
      title={t('report.rentIncomeTitle')}
      queryKey="report-rent-income"
      queryFn={(params) => reportService.rentIncome(params)}
      chartTitle={t('report.incomeTrendChartTitle')}
      chartDescription={t('report.incomeTrendChartDesc')}
      extraFilters={
        <>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
            allowClear
            placeholder={t('report.period')}
            options={[{ value: '', label: t('common.all') }, ...periodOptions]}
          />
          <Segmented
            value={trendMode}
            onChange={(v) => setTrendMode(v as TrendMode)}
            options={trendModeOptions}
            className="ml-2"
          />
        </>
      }
      extraParams={period ? { period } : {}}
      kpiCards={kpiCards}
      chartOption={chartOption}
      columns={columns}
    />
  );
}
