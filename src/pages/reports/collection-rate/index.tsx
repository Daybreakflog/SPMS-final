import { useState } from 'react';
import { Card, Col, Row, Statistic, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { reportService } from '@/services/report.service';
import ReportTemplate from '../components/ReportTemplate';
import type { CollectionRateKpi, CollectionRateChart } from '@/types';

export default function CollectionRatePage() {
  const { t } = useTranslation();
  const [compareMode, setcompareMode] = useState<'single' | 'overlay'>('single');

  const columns: TableColumnsType<Record<string, unknown>> = [
    { title: t('report.project'), dataIndex: 'project', width: 150 },
    { title: t('report.receivable'), dataIndex: 'receivable', width: 130, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: t('report.collected'), dataIndex: 'collected', width: 130, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: t('report.collectionRate'), dataIndex: 'collectionRate', width: 110, render: (v: number) => `${v}%` },
    { title: t('report.overdueAmount'), dataIndex: 'overdueAmount', width: 130, render: (v: number) => `¥${v?.toLocaleString()}` },
  ];

  const kpiCards = (kpis: Record<string, unknown>) => {
    const d = kpis as unknown as CollectionRateKpi;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.overallRate')} value={d.overallRate} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.collectedTotal')} value={d.collectedTotal} prefix="¥" precision={0} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.uncollectedTotal')} value={d.uncollectedTotal} prefix="¥" precision={0} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.overdueRate')} value={d.overdueRate} suffix="%" precision={1} /></Card>
        </Col>
      </Row>
    );
  };

  const chartOption = (data: unknown[]) => {
    const chartData = data as CollectionRateChart[];
    const colors = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'];

    if (compareMode === 'overlay') {
      // 多项目叠加对比：每个项目一条折线
      const projects = [...new Set(chartData.map((d) => d.project))];
      const months = [...new Set(chartData.map((d) => (d as CollectionRateChart & { month?: string }).month ?? d.project))];
      return {
        tooltip: { trigger: 'axis' as const },
        legend: { data: projects },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category' as const, data: months },
        yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
        series: projects.map((project, i) => ({
          name: project,
          type: 'line' as const,
          data: chartData.filter((d) => d.project === project).map((d) => d.rate),
          smooth: true,
          itemStyle: { color: colors[i % colors.length] },
        })),
      };
    }

    return {
      tooltip: { trigger: 'axis' as const },
      legend: { data: [t('report.projectComparison')] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category' as const, data: chartData.map((d) => d.project) },
      yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: t('report.projectComparison'),
          type: 'bar' as const,
          data: chartData.map((d) => d.rate),
          itemStyle: { color: '#52c41a' },
        },
      ],
    };
  };

  return (
    <ReportTemplate
      title={t('report.collectionRateTitle')}
      queryKey="report-collection-rate"
      queryFn={(params) => reportService.collectionRate(params)}
      extraFilters={
        <Segmented
          value={compareMode}
          onChange={(v) => setcompareMode(v as 'single' | 'overlay')}
          options={[
            { value: 'single', label: t('report.compareSingle') },
            { value: 'overlay', label: t('report.compareOverlay') },
          ]}
        />
      }
      kpiCards={kpiCards}
      chartOption={chartOption}
      columns={columns}
    />
  );
}
