import { useState } from 'react';
import { Card, Col, Row, Select, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import EChart from '@/components/EChart';
import KpiCard from '@/pages/dashboard/components/KpiCard';
import { DollarOutlined, PieChartOutlined, ProjectOutlined, BarChartOutlined } from '@ant-design/icons';
import { reportService } from '@/services/report.service';
import { exportToExcel } from '@/utils/export';

interface FeeAnalysisData {
  totalIncome: number;
  topFeeItem: string;
  projectCount: number;
  avgIncome: number;
  pieData: Array<{ name: string; value: number }>;
  trendData: Array<{ month: string; items: Record<string, number> }>;
  projectCompare: Array<{ project: string; items: Record<string, number> }>;
}

export default function FeeAnalysisPage() {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  const { data } = useQuery({
    queryKey: ['fee-analysis', projectId],
    queryFn: () => reportService.feeAnalysis(projectId ? { projectId } : undefined) as Promise<FeeAnalysisData>,
  });

  const pieOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical' as const, left: 'left' },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '70%'],
      label: { show: true, formatter: '{b}: {d}%' },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' as const } },
      data: data?.pieData ?? [],
    }],
  };

  const feeItems = data?.trendData?.[0] ? Object.keys(data.trendData[0].items) : [];
  const trendOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: feeItems },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category' as const, data: data?.trendData?.map((d) => d.month) ?? [] },
    yAxis: { type: 'value' as const },
    series: feeItems.map((item) => ({
      name: item,
      type: 'line' as const,
      smooth: true,
      data: data?.trendData?.map((d) => d.items[item] ?? 0) ?? [],
    })),
  };

  const projects = data?.projectCompare?.map((p) => p.project) ?? [];
  const compareFeeItems = data?.projectCompare?.[0] ? Object.keys(data.projectCompare[0].items) : [];
  const compareOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: compareFeeItems },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category' as const, data: projects },
    yAxis: { type: 'value' as const },
    series: compareFeeItems.map((item) => ({
      name: item,
      type: 'bar' as const,
      stack: 'total',
      data: data?.projectCompare?.map((p) => p.items[item] ?? 0) ?? [],
    })),
  };

  const handleExport = () => {
    if (!data?.pieData) return;
    const exportCols = [
      { title: t('feeAnalysis.feeItem'), dataIndex: 'name' },
      { title: t('feeAnalysis.amount'), dataIndex: 'value' },
    ];
    exportToExcel(
      data.pieData as unknown as Record<string, unknown>[],
      exportCols,
      'fee-analysis',
    );
  };

  return (
    <div>
      <PageHeader
        title={t('feeAnalysis.title')}
        extra={
          <Space>
            <Select
              value={projectId}
              onChange={setProjectId}
              allowClear
              placeholder={t('dashboard.allProjects')}
              style={{ width: 200 }}
              options={[
                { value: 'project-001', label: '翡翠湾花园' },
                { value: 'project-002', label: '阳光城' },
                { value: 'project-003', label: '锦绣华庭' },
              ]}
            />
            <Button onClick={handleExport}>{t('report.exportExcel')}</Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title={t('feeAnalysis.totalIncome')} value={data?.totalIncome ?? 0} prefix={<DollarOutlined />} precision={2} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title={t('feeAnalysis.topFeeItem')} value={0} suffix="" icon={<PieChartOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title={t('feeAnalysis.projectCount')} value={data?.projectCount ?? 0} icon={<ProjectOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard title={t('feeAnalysis.avgIncome')} value={data?.avgIncome ?? 0} prefix={<BarChartOutlined />} precision={2} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card title={t('feeAnalysis.incomePie')}>
            <EChart option={pieOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('feeAnalysis.trendLine')}>
            <EChart option={trendOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Card title={t('feeAnalysis.projectCompare')} className="mt-4">
        <EChart option={compareOption} style={{ height: 350 }} />
      </Card>
    </div>
  );
}
