import { useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Tag, Progress } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { RepairTypeLabelKeys, UrgencyLabelKeys } from '@/constants/status';
import ReportTemplate from '../components/ReportTemplate';
import type { RepairAnalysisKpi, RepairAnalysisChart, EngineerRank } from '@/types';

export default function RepairAnalysisPage() {
  const { t } = useTranslation();
  const [repairType, setRepairType] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');

  const typeOptions = Object.entries(RepairTypeLabelKeys).map(([value, key]) => ({ value, label: t(key) }));
  const urgencyOptions = Object.entries(UrgencyLabelKeys).map(([value, key]) => ({ value, label: t(key) }));

  const columns: TableColumnsType<Record<string, unknown>> = [
    { title: t('report.repairNo'), dataIndex: 'repairNo', width: 150 },
    { title: t('report.repairType'), dataIndex: 'repairType', width: 100 },
    { title: t('report.urgency'), dataIndex: 'urgency', width: 100 },
    { title: t('report.processHours'), dataIndex: 'processHours', width: 120, render: (v: number) => `${v}h` },
    { title: t('report.rating'), dataIndex: 'rating', width: 80 },
    { title: t('report.status'), dataIndex: 'status', width: 100 },
  ];

  const kpiCards = (kpis: Record<string, unknown>) => {
    const d = kpis as unknown as RepairAnalysisKpi;
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.totalOrders')} value={d.totalOrders} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.avgProcessTime')} value={d.avgProcessTime} suffix="h" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.timeoutRate')} value={d.timeoutRate} suffix="%" precision={1} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title={t('report.satisfactionRate')} value={d.satisfactionRate} suffix="%" precision={1} /></Card>
        </Col>
      </Row>
    );
  };

  const chartOption = (data: unknown[]) => {
    const chartData = data as RepairAnalysisChart[];
    return {
      tooltip: { trigger: 'axis' as const },
      legend: { data: [t('report.typeDistribution')] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category' as const, data: chartData.map((d) => d.type) },
      yAxis: { type: 'value' as const },
      series: [
        {
          name: t('report.typeDistribution'),
          type: 'bar' as const,
          data: chartData.map((d) => d.count),
          itemStyle: { color: '#faad14' },
        },
      ],
    };
  };

  const { data: engineerData } = useQuery({
    queryKey: ['engineer-rank'],
    queryFn: () => reportService.repairAnalysis({ pageSize: 5 } as Parameters<typeof reportService.repairAnalysis>[0]).then((r) => {
      // Engineer rank is injected into the mock response
      const d = r as unknown as { engineerRank?: EngineerRank[] };
      return d.engineerRank ?? [];
    }),
  });

  const engineerColumns: TableColumnsType<EngineerRank> = [
    {
      title: t('report.rankNo'),
      key: 'rank',
      width: 60,
      render: (_: unknown, __: EngineerRank, idx: number) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[idx] ?? idx + 1;
      },
    },
    { title: t('report.engineerName'), dataIndex: 'engineerName', width: 120 },
    { title: t('report.completedOrders'), dataIndex: 'completed', width: 100 },
    {
      title: t('report.avgProcessTime'),
      dataIndex: 'avgTime',
      width: 120,
      render: (v: number) => `${v.toFixed(1)}h`,
    },
    {
      title: t('report.engineerRating'),
      dataIndex: 'rating',
      width: 160,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <Progress percent={v * 20} size="small" strokeColor="#faad14" className="w-24" showInfo={false} />
          <span className="text-sm">{v.toFixed(1)}</span>
        </div>
      ),
    },
    {
      title: t('report.timeoutOrders'),
      dataIndex: 'timeoutCount',
      width: 100,
      render: (v: number) => <Tag color={v > 0 ? 'red' : 'green'}>{v}</Tag>,
    },
  ];

  return (
    <>
    <ReportTemplate
      title={t('report.repairAnalysisTitle')}
      queryKey="report-repair-analysis"
      queryFn={(params) => reportService.repairAnalysis(params)}
      extraFilters={
        <>
          <Select
            value={repairType}
            onChange={setRepairType}
            style={{ width: 120 }}
            allowClear
            placeholder={t('report.repairType')}
            options={[{ value: '', label: t('common.all') }, ...typeOptions]}
          />
          <Select
            value={urgency}
            onChange={setUrgency}
            style={{ width: 120, marginLeft: 8 }}
            allowClear
            placeholder={t('report.urgency')}
            options={[{ value: '', label: t('common.all') }, ...urgencyOptions]}
          />
        </>
      }
      extraParams={{
        ...(repairType ? { repairType } : {}),
        ...(urgency ? { urgency } : {}),
      }}
      kpiCards={kpiCards}
      chartOption={chartOption}
      columns={columns}
    />
    {/* 工程师绩效排名 */}
    <Card
      className="mt-4"
      title={
        <span className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          {t('report.engineerRankTitle')}
        </span>
      }
    >
      <Table<EngineerRank>
        dataSource={engineerData ?? []}
        columns={engineerColumns}
        rowKey="engineerName"
        pagination={false}
        size="middle"
      />
    </Card>
    </>
  );
}
