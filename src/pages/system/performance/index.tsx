import { useState, useMemo } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Progress } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import EChart from '@/components/EChart';

interface VitalEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface RoutePerf {
  route: string;
  avgDuration: number;
  maxDuration: number;
  visits: number;
}

const VITAL_THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  FID: { good: 100, poor: 300, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
};

function rateVital(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = VITAL_THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

const RATING_COLORS = {
  good: '#52c41a',
  'needs-improvement': '#faad14',
  poor: '#ff4d4f',
};

function generateMockVitals(): VitalEntry[] {
  const entries = [
    { name: 'LCP', value: 1800 + Math.random() * 2000 },
    { name: 'FID', value: 30 + Math.random() * 200 },
    { name: 'CLS', value: Math.random() * 0.3 },
    { name: 'FCP', value: 1200 + Math.random() * 1500 },
    { name: 'TTFB', value: 200 + Math.random() * 1200 },
  ];
  return entries.map((e) => ({
    ...e,
    value: Math.round(e.value * 100) / 100,
    rating: rateVital(e.name, e.value),
  }));
}

function generateMockRoutePerf(): RoutePerf[] {
  const routes = [
    '/dashboard', '/billing/bills', '/contracts', '/service/repairs',
    '/customers/renters', '/org/projects', '/notice/announcements',
    '/reports/rent-income', '/system/audit-logs', '/properties/tree',
  ];
  return routes.map((route) => ({
    route,
    avgDuration: Math.round(50 + Math.random() * 300),
    maxDuration: Math.round(200 + Math.random() * 800),
    visits: Math.round(5 + Math.random() * 100),
  }));
}

function generateTrendData() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  });
  return {
    days,
    lcp: days.map(() => Math.round(1500 + Math.random() * 2000)),
    fcp: days.map(() => Math.round(1000 + Math.random() * 1500)),
    ttfb: days.map(() => Math.round(200 + Math.random() * 1000)),
  };
}

export default function PerformancePage() {
  const { t } = useTranslation();
  const [vitals] = useState<VitalEntry[]>(generateMockVitals);
  const [routePerfs] = useState<RoutePerf[]>(generateMockRoutePerf);
  const [trendData] = useState<ReturnType<typeof generateTrendData>>(generateTrendData);

  const vitalI18nMap: Record<string, string> = {
    LCP: t('performance.lcp'),
    FID: t('performance.fid'),
    CLS: t('performance.cls'),
    FCP: t('performance.fcp'),
    TTFB: t('performance.ttfb'),
  };

  const ratingLabel = (r: string) => {
    if (r === 'good') return t('performance.good');
    if (r === 'needs-improvement') return t('performance.needsImprovement');
    return t('performance.poor');
  };

  const overallScore = useMemo(() => {
    if (vitals.length === 0) return 0;
    const scores = vitals.map((v) => (v.rating === 'good' ? 100 : v.rating === 'needs-improvement' ? 60 : 20));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [vitals]);

  const scoreColor = overallScore >= 80 ? '#52c41a' : overallScore >= 50 ? '#faad14' : '#ff4d4f';

  const trendOption = trendData ? {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['LCP', 'FCP', 'TTFB'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category' as const, data: trendData.days },
    yAxis: { type: 'value' as const, name: t('performance.ms') },
    series: [
      { name: 'LCP', type: 'line' as const, data: trendData.lcp, smooth: true, itemStyle: { color: '#1890ff' } },
      { name: 'FCP', type: 'line' as const, data: trendData.fcp, smooth: true, itemStyle: { color: '#52c41a' } },
      { name: 'TTFB', type: 'line' as const, data: trendData.ttfb, smooth: true, itemStyle: { color: '#faad14' } },
    ],
  } : {};

  const routeColumns: TableColumnsType<RoutePerf> = [
    { title: t('performance.route'), dataIndex: 'route', width: 200 },
    {
      title: t('performance.avgDuration'),
      dataIndex: 'avgDuration',
      width: 120,
      sorter: (a, b) => a.avgDuration - b.avgDuration,
      render: (v: number) => (
        <span style={{ color: v < 100 ? '#52c41a' : v < 300 ? '#faad14' : '#ff4d4f' }}>
          {v}{t('performance.ms')}
        </span>
      ),
    },
    {
      title: t('performance.maxDuration'),
      dataIndex: 'maxDuration',
      width: 120,
      sorter: (a, b) => a.maxDuration - b.maxDuration,
      render: (v: number) => `${v}${t('performance.ms')}`,
    },
    {
      title: t('performance.visits'),
      dataIndex: 'visits',
      width: 100,
      sorter: (a, b) => a.visits - b.visits,
    },
  ];

  return (
    <div>
      <PageHeader title={t('performance.title')} />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <div className="flex flex-col items-center">
              <Progress
                type="dashboard"
                percent={overallScore}
                strokeColor={scoreColor}
                format={(p) => <span className="text-2xl font-bold">{p}</span>}
              />
              <span className="mt-2 text-sm text-text-secondary">{t('performance.score')}</span>
            </div>
          </Card>
        </Col>
        {vitals.map((v) => (
          <Col xs={12} sm={6} lg={Math.floor(18 / vitals.length)} key={v.name}>
            <Card size="small">
              <Statistic
                title={vitalI18nMap[v.name] || v.name}
                value={v.value}
                suffix={VITAL_THRESHOLDS[v.name]?.unit || ''}
                valueStyle={{ color: RATING_COLORS[v.rating], fontSize: 20 }}
                prefix={
                  v.name === 'LCP' ? <DashboardOutlined /> :
                  v.name === 'FID' ? <ThunderboltOutlined /> :
                  v.name === 'TTFB' ? <ClockCircleOutlined /> :
                  <AimOutlined />
                }
              />
              <Tag color={RATING_COLORS[v.rating]} className="mt-2">
                {ratingLabel(v.rating)}
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <Card title={t('performance.performanceTrend')}>
            {trendData && <EChart option={trendOption} style={{ height: 300 }} />}
          </Card>
        </Col>
      </Row>

      <Card title={t('performance.routePerf')} className="mt-4">
        <Table<RoutePerf>
          columns={routeColumns}
          dataSource={routePerfs}
          rowKey="route"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
