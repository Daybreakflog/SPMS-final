import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Card, Col, Row, Select, Switch, Space, Segmented, InputNumber, Tooltip } from 'antd';
import {
  HomeOutlined,
  DollarOutlined,
  ToolOutlined,
  AlertOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import EChart from '@/components/EChart';
import PageHeader from '@/components/PageHeader';
import { dashboardService } from '@/services/dashboard.service';
import { formatDateTime } from '@/utils/format';
import type { CollectionTrend, RepairStatusDistribution, TodoItem, AnnouncementBrief, ExpiringContract } from '@/types';
import KpiCard from './components/KpiCard';
import ChartSkeleton from './components/ChartSkeleton';

const DASHBOARD_PREFS_KEY = 'dashboard-layout-prefs';

interface DashboardPrefs {
  density: 'compact' | 'standard';
  visibleModules: Record<string, boolean>;
}

function loadPrefs(): DashboardPrefs {
  try {
    const saved = localStorage.getItem(DASHBOARD_PREFS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { density: 'standard', visibleModules: { kpi: true, trend: true, repair: true, todo: true, announcement: true, expiring: true } };
}

function savePrefs(prefs: DashboardPrefs) {
  localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(prefs));
}

const projectOptions = [
  { value: 'project-001', label: '翡翠湾花园' },
  { value: 'project-002', label: '阳光城' },
  { value: 'project-003', label: '锦绣华庭' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [prefs, setPrefs] = useState<DashboardPrefs>(loadPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 数据大屏模式
  const [fullscreen, setFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [expiryDays, setExpiryDays] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [fullscreen]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const updatePrefs = (partial: Partial<DashboardPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  };

  const toggleModule = (key: string) => {
    updatePrefs({ visibleModules: { ...prefs.visibleModules, [key]: !prefs.visibleModules[key] } });
  };

  const isVisible = (key: string) => prefs.visibleModules[key] !== false;
  const gutter: [number, number] = prefs.density === 'compact' ? [8, 8] : [16, 16];

  const { data: overview, refetch: overviewRefetch } = useQuery({
    queryKey: ['dashboard-overview', projectId],
    queryFn: () => dashboardService.overview(projectId ? { projectId } : undefined),
  });

  const { data: trend, isLoading: trendLoading, refetch: trendRefetch } = useQuery({
    queryKey: ['dashboard-trend', projectId],
    queryFn: () => dashboardService.trend(projectId ? { projectId } : undefined),
  });

  const { data: repairDist, isLoading: repairLoading, refetch: repairRefetch } = useQuery({
    queryKey: ['dashboard-repair-dist', projectId],
    queryFn: () => dashboardService.repairDist(projectId ? { projectId } : undefined),
  });

  const { data: todoList, refetch: todoRefetch } = useQuery({
    queryKey: ['dashboard-todos'],
    queryFn: () => dashboardService.todoList(),
  });

  const { data: latestNotice, refetch: noticeRefetch } = useQuery({
    queryKey: ['dashboard-latest-announcements'],
    queryFn: () => dashboardService.latestNotice(),
  });

  const { data: expiringContracts, refetch: expiringRefetch } = useQuery({
    queryKey: ['dashboard-expiring-contracts', expiryDays],
    queryFn: () => dashboardService.expiringContracts(expiryDays),
  });

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        overviewRefetch();
        trendRefetch();
        repairRefetch();
        todoRefetch();
        noticeRefetch();
        expiringRefetch();
      }, refreshInterval * 1000);
    }
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, [autoRefresh, refreshInterval, overviewRefetch, trendRefetch, repairRefetch, todoRefetch, noticeRefetch, expiringRefetch]);

  const handleTrendClick = useCallback((params: { name?: string }) => {
    if (params.name) {
      navigate(`/billing/bills?period=${params.name}`);
    }
  }, [navigate]);

  const handleRepairClick = useCallback((params: { name?: string }) => {
    if (params.name) {
      navigate('/service/repairs');
    }
  }, [navigate]);

  const expiringList = (expiringContracts as ExpiringContract[] | undefined) ?? [];
  const trendData = trend as CollectionTrend[] | undefined;
  const repairDistData = repairDist as RepairStatusDistribution[] | undefined;
  const todos = (todoList as TodoItem[] | undefined) ?? [];
  const announcements = (latestNotice as AnnouncementBrief[] | undefined) ?? [];

  const trendOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ seriesName: string; name: string; value: number; marker: string }>) => {
        const header = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.name}</div>`;
        const rows = params.map((p) =>
          `<div>${p.marker} ${p.seriesName}: ¥${p.value.toLocaleString()}</div>`
        ).join('');
        const receivable = params.find((p) => p.seriesName === t('dashboard.receivable'))?.value ?? 0;
        const collected = params.find((p) => p.seriesName === t('dashboard.collected'))?.value ?? 0;
        const rate = receivable > 0 ? ((collected / receivable) * 100).toFixed(1) : '0.0';
        return `${header}${rows}<div style="margin-top:4px;color:#888">${t('dashboard.collectionRate')}: ${rate}%</div>`;
      },
    },
    legend: { data: [t('dashboard.receivable'), t('dashboard.collected')] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category' as const, data: trendData?.map((item) => item.month) || [] },
    yAxis: { type: 'value' as const },
    series: [
      {
        name: t('dashboard.receivable'),
        type: 'line' as const,
        data: trendData?.map((item) => item.receivable) || [],
        smooth: true,
        itemStyle: { color: '#1890ff' },
        emphasis: { itemStyle: { borderWidth: 3 } },
      },
      {
        name: t('dashboard.collected'),
        type: 'line' as const,
        data: trendData?.map((item) => item.collected) || [],
        smooth: true,
        itemStyle: { color: '#52c41a' },
        emphasis: { itemStyle: { borderWidth: 3 } },
      },
    ],
  };

  const repairOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    legend: { orient: 'vertical' as const, left: 'left' },
    series: [
      {
        type: 'pie' as const,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: true, formatter: '{b}: {c}' },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' as const },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        data: repairDistData?.map((d) => ({ name: d.label, value: d.count })) || [],
      },
    ],
  };

  const kpiCards = [
    {
      title: t('dashboard.occupancyRate'),
      value: overview?.occupancyRate ?? 0,
      trend: overview?.occupancyRateTrend,
      suffix: '%',
      icon: <HomeOutlined />,
    },
    {
      title: t('dashboard.monthlyReceivable'),
      value: overview?.monthlyReceivable ?? 0,
      trend: overview?.monthlyReceivableTrend,
      prefix: <DollarOutlined />,
      precision: 2,
      onClick: () => navigate('/billing/bills'),
    },
    {
      title: t('dashboard.monthlyCollected'),
      value: overview?.monthlyCollected ?? 0,
      trend: overview?.monthlyCollectedTrend,
      prefix: <DollarOutlined />,
      precision: 2,
      onClick: () => navigate('/billing/bills'),
    },
    {
      title: t('dashboard.collectionRate'),
      value: overview?.collectionRate ?? 0,
      trend: overview?.collectionRateTrend,
      suffix: '%',
      icon: <DollarOutlined />,
    },
    {
      title: t('dashboard.pendingRepairs'),
      value: overview?.pendingRepairs ?? 0,
      trend: overview?.pendingRepairsTrend,
      icon: <ToolOutlined />,
      onClick: () => navigate('/service/repairs'),
    },
    {
      title: t('dashboard.overdueBills'),
      value: overview?.overdueBillsCount ?? 0,
      trend: overview?.overdueBillsTrend,
      icon: <AlertOutlined />,
      onClick: () => navigate('/billing/bills'),
    },
  ];

  return (
    <div ref={containerRef} className={fullscreen ? 'overflow-auto bg-bg-layout p-6' : ''}>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        extra={
          <Space>
            <Select
              value={projectId}
              onChange={setProjectId}
              allowClear
              placeholder={t('dashboard.allProjects')}
              style={{ width: 200 }}
              options={projectOptions}
            />
            {fullscreen && (
              <>
                <Space size={4}>
                  <Switch
                    size="small"
                    checked={autoRefresh}
                    onChange={setAutoRefresh}
                  />
                  <span className="text-sm">{t('dashboardScreen.autoRefresh')}</span>
                </Space>
                {autoRefresh && (
                  <InputNumber
                    size="small"
                    min={5}
                    max={300}
                    value={refreshInterval}
                    onChange={(v) => v && setRefreshInterval(v)}
                    addonAfter={t('dashboardScreen.seconds')}
                    style={{ width: 120 }}
                  />
                )}
              </>
            )}
            <Tooltip title={fullscreen ? t('dashboardScreen.exitFullscreen') : t('dashboardScreen.enterFullscreen')}>
              <Button
                icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
            </Tooltip>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsOpen(!settingsOpen)} />
          </Space>
        }
      />

      {settingsOpen && (
        <Card size="small" className="mb-4">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{t('dashboard.layoutSettings')}:</span>
              <Segmented
                value={prefs.density}
                onChange={(v) => updatePrefs({ density: v as 'compact' | 'standard' })}
                options={[
                  { value: 'compact', label: t('dashboard.densityCompact') },
                  { value: 'standard', label: t('dashboard.densityStandard') },
                ]}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              {(['kpi', 'trend', 'repair', 'expiring', 'todo', 'announcement'] as const).map((key) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <Switch size="small" checked={isVisible(key)} onChange={() => toggleModule(key)} />
                  <span>{{
                    kpi: 'KPI',
                    trend: t('dashboard.collectionTrend'),
                    repair: t('dashboard.repairDistribution'),
                    expiring: t('contractExpiry.title'),
                    todo: t('dashboard.todoList'),
                    announcement: t('dashboard.latestAnnouncements'),
                  }[key]}</span>
                </label>
              ))}
            </div>
          </Space>
        </Card>
      )}

      {isVisible('kpi') && (
        <Row gutter={gutter}>
          {kpiCards.map((kpi) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={kpi.title}>
              <KpiCard {...kpi} />
            </Col>
          ))}
        </Row>
      )}

      <Row gutter={gutter} className="mt-4">
        {isVisible('trend') && (
          <Col xs={24} lg={isVisible('repair') ? 16 : 24}>
            <Card title={t('dashboard.collectionTrend')}>
              {trendLoading ? (
                <ChartSkeleton />
              ) : (
                <EChart
                  option={trendOption}
                  style={{ height: 300 }}
                  onEvents={{ click: handleTrendClick }}
                />
              )}
            </Card>
          </Col>
        )}
        {isVisible('repair') && (
          <Col xs={24} lg={isVisible('trend') ? 8 : 24}>
            <Card title={t('dashboard.repairDistribution')}>
              {repairLoading ? (
                <ChartSkeleton />
              ) : (
                <EChart
                  option={repairOption}
                  style={{ height: 300 }}
                  onEvents={{ click: handleRepairClick }}
                />
              )}
            </Card>
          </Col>
        )}
      </Row>

      {isVisible('expiring') && (
        <Card
          title={t('contractExpiry.title')}
          className="mt-4"
          extra={
            <Space>
              <Select
                size="small"
                value={expiryDays}
                onChange={setExpiryDays}
                options={[
                  { value: 30, label: `30 ${t('contractExpiry.days')}` },
                  { value: 60, label: `60 ${t('contractExpiry.days')}` },
                  { value: 90, label: `90 ${t('contractExpiry.days')}` },
                ]}
                style={{ width: 100 }}
              />
              <Button type="link" size="small" onClick={() => navigate('/contracts')}>
                {t('contractExpiry.viewAll')}
              </Button>
            </Space>
          }
        >
          {expiringList.length === 0 ? (
            <div className="py-8 text-center text-text-tertiary">{t('contractExpiry.noExpiring')}</div>
          ) : (
            <div className="divide-y divide-border">
              {expiringList.map((c) => (
                <div
                  key={c.id}
                  className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-fill-quaternary"
                  onClick={() => navigate(`/contracts/${c.id}`)}
                >
                  <div>
                    <span className="mr-2 font-medium">{c.contractNo}</span>
                    <span className="text-sm text-text-secondary">{c.renterName} · {c.unitNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-text-secondary">{c.endDate}</span>
                    <span className={`ml-2 text-sm font-medium ${c.daysRemaining <= 15 ? 'text-error' : c.daysRemaining <= 30 ? 'text-warning' : 'text-text-secondary'}`}>
                      {c.daysRemaining} {t('contractExpiry.days')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Row gutter={gutter} className="mt-4">
        {isVisible('todo') && (
          <Col xs={24} lg={isVisible('announcement') ? 16 : 24}>
            <Card
              title={t('dashboard.todoList')}
              extra={
                <Button type="link" size="small" onClick={() => navigate('/contracts')}>
                  {t('dashboard.viewAll')}
                </Button>
              }
            >
              <div className="divide-y divide-border">
                {todos.length === 0 && (
                  <div className="py-8 text-center text-text-tertiary">{t('dashboard.noTodo')}</div>
                )}
                {todos.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer px-4 py-3 transition-colors hover:bg-fill-quaternary"
                    onClick={() => navigate(item.targetUrl)}
                  >
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="mt-1">
                      <span className="text-sm text-text-secondary">{item.description}</span>
                      {item.deadline && (
                        <span className="ml-2 text-xs text-warning">
                          {t('dashboard.deadline')}: {item.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        )}
        {isVisible('announcement') && (
          <Col xs={24} lg={isVisible('todo') ? 8 : 24}>
            <Card
              title={t('dashboard.latestAnnouncements')}
              extra={
                <Button type="link" size="small" onClick={() => navigate('/notice/announcements')}>
                  {t('dashboard.viewAll')}
                </Button>
              }
            >
              <div className="divide-y divide-border">
                {announcements.length === 0 && (
                  <div className="py-8 text-center text-text-tertiary">{t('common.noData')}</div>
                )}
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer px-4 py-3 transition-colors hover:bg-fill-quaternary"
                    onClick={() => navigate('/notice/announcements')}
                  >
                    <div className="text-sm">{item.title}</div>
                    <div className="mt-1 text-xs text-text-tertiary">
                      {formatDateTime(item.publishedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
