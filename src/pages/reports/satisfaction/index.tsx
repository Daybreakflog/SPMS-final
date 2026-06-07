import { useState } from 'react';
import { Card, Col, Row, Select, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { reportService } from '@/services/report.service';
import { RatingRangeLabelKeys } from '@/constants/status';
import { formatDateTime } from '@/utils/format';
import ReportTemplate from '../components/ReportTemplate';
import type { SatisfactionKpi, SatisfactionChart } from '@/types';

export default function SatisfactionPage() {
  const { t } = useTranslation();
  const [ratingRange, setRatingRange] = useState<string>('');

  const rangeOptions = Object.entries(RatingRangeLabelKeys).map(([value, key]) => ({ value, label: t(key) }));

  const columns: TableColumnsType<Record<string, unknown>> = [
    { title: t('report.repairNo'), dataIndex: 'repairNo', width: 150 },
    { title: t('report.renter'), dataIndex: 'renterName', width: 100 },
    { title: t('report.rating'), dataIndex: 'rating', width: 80 },
    { title: t('report.comment'), dataIndex: 'comment', width: 250, ellipsis: true },
    { title: t('report.ratedAt'), dataIndex: 'ratedAt', width: 170, render: (v: string) => formatDateTime(v) },
  ];

  const kpiCards = (kpis: Record<string, unknown>) => {
    const d = kpis as unknown as SatisfactionKpi;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.avgRating')} value={d.avgRating} suffix="分" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.fiveStarRate')} value={d.fiveStarRate} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.lowRatingRate')} value={d.lowRatingRate} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.totalRatings')} value={d.totalRatings} /></Card>
        </Col>
      </Row>
    );
  };

  const chartOption = (data: unknown[]) => {
    const chartData = data as SatisfactionChart[];
    return {
      tooltip: { trigger: 'axis' as const },
      legend: { data: [t('report.ratingTrend')] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category' as const, data: chartData.map((d) => d.month) },
      yAxis: { type: 'value' as const, min: 1, max: 5 },
      series: [
        {
          name: t('report.ratingTrend'),
          type: 'line' as const,
          data: chartData.map((d) => d.avgRating),
          smooth: true,
          itemStyle: { color: '#722ed1' },
        },
      ],
    };
  };

  return (
    <ReportTemplate
      title={t('report.satisfactionTitle')}
      queryKey="report-satisfaction"
      queryFn={(params) => reportService.satisfaction(params)}
      extraFilters={
        <Select
          value={ratingRange}
          onChange={setRatingRange}
          style={{ width: 120 }}
          allowClear
          placeholder={t('report.ratingRange')}
          options={[{ value: '', label: t('common.all') }, ...rangeOptions]}
        />
      }
      extraParams={ratingRange ? { ratingRange } : {}}
      kpiCards={kpiCards}
      chartOption={chartOption}
      columns={columns}
    />
  );
}
