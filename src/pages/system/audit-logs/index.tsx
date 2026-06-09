import { useState } from 'react';
import { Button, DatePicker, Form, Input, Select, Segmented, Card, Tag, Row, Col } from 'antd';
import { UnorderedListOutlined, DownloadOutlined, BarChartOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import EChart from '@/components/EChart';
import PermissionGuard from '@/components/PermissionGuard';
import { useTableQuery } from '@/hooks/useTableQuery';
import { auditService } from '@/services/audit.service';
import { AuditModuleLabelKeys, AuditActionLabelKeys, AuditResultMeta } from '@/constants/status';
import { RoleCode, AuditResult } from '@/types/enums';
import { formatDateTime } from '@/utils/format';
import { exportToExcel } from '@/utils/export';
import { getMessageApi } from '@/utils/antd';
import type { AuditLog, AuditLogListParams } from '@/types';
import AuditDetailModal from './components/AuditDetailModal';

const { RangePicker } = DatePicker;

function useStatusOptions() {
  const { t } = useTranslation();
  const moduleOptions = Object.entries(AuditModuleLabelKeys).map(([value, key]) => ({ value, label: t(key) }));
  const actionOptions = Object.entries(AuditActionLabelKeys).map(([value, key]) => ({ value, label: t(key) }));
  const resultOptions = Object.entries(AuditResultMeta).map(([value, meta]) => ({ value, label: t(meta.labelKey) }));
  return { moduleOptions, actionOptions, resultOptions };
}

// 操作回放模式（基于 /system/audit-logs/resource-history）已移除，
// 后端没有按资源 id 查时间线的接口

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [detailRecord, setDetailRecord] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  const { moduleOptions, actionOptions } = useStatusOptions();

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset } =
    useTableQuery<AuditLog, AuditLogListParams>({
      queryKey: 'audit-logs',
      queryFn: (params) => auditService.list(params),
    });

  const handleExport = () => {
    if (data.length === 0) { getMessageApi()?.warning(t('common.noData')); return; }
    const exportCols = [
      { title: t('audit.operatedAt'), dataIndex: 'createdAt' },
      { title: t('audit.operatorName'), dataIndex: 'operatorName' },
      { title: t('audit.module'), dataIndex: 'module' },
      { title: t('audit.action'), dataIndex: 'action' },
      { title: t('audit.targetResource'), dataIndex: 'targetResource' },
      { title: t('audit.ipAddress'), dataIndex: 'ipAddress' },
      { title: t('audit.result'), dataIndex: 'result' },
    ];
    exportToExcel(data as unknown as Record<string, unknown>[], exportCols, 'audit-logs');
    getMessageApi()?.success(t('report.exportSuccess'));
  };

  // 统计图表数据
  const moduleCounts = data.reduce<Record<string, number>>((acc, log) => {
    acc[log.module] = (acc[log.module] ?? 0) + 1; return acc;
  }, {});
  const actionCounts = data.reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1; return acc;
  }, {});
  const failLogs = data.filter((d) => d.result === AuditResult.FAILURE);

  const handleSearch = (values: Partial<AuditLogListParams & { dateRange?: [unknown, unknown] }>) => {
    const { dateRange, ...rest } = values;
    const filter: Partial<AuditLogListParams> = { ...rest };
    if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      filter.startDate = (dateRange[0] as { format: (f: string) => string }).format('YYYY-MM-DD');
      filter.endDate = (dateRange[1] as { format: (f: string) => string }).format('YYYY-MM-DD');
    }
    onFilterChange(filter as AuditLogListParams);
  };

  const columns: TableColumnsType<AuditLog> = [
    { title: t('audit.operatedAt'), dataIndex: 'createdAt', width: 170, render: (v: string) => formatDateTime(v) },
    { title: t('audit.operatorName'), dataIndex: 'operatorName', width: 100 },
    { title: t('audit.module'), dataIndex: 'module', width: 80, render: (v: string) => AuditModuleLabelKeys[v as keyof typeof AuditModuleLabelKeys] ? t(AuditModuleLabelKeys[v as keyof typeof AuditModuleLabelKeys]) : v },
    { title: t('audit.action'), dataIndex: 'action', width: 80, render: (v: string) => AuditActionLabelKeys[v as keyof typeof AuditActionLabelKeys] ? t(AuditActionLabelKeys[v as keyof typeof AuditActionLabelKeys]) : v },
    { title: t('audit.targetResource'), dataIndex: 'targetResource', width: 200, ellipsis: true },
    { title: t('audit.ipAddress'), dataIndex: 'ipAddress', width: 140 },
    { title: t('audit.result'), dataIndex: 'result', width: 80, render: (v: string) => <StatusTag status={v as AuditResult} statusMap={AuditResultMeta} /> },
    {
      title: t('common.operation'), width: 80, fixed: 'right',
      render: (_: unknown, record: AuditLog) => (
        <Button type="link" size="small" disabled={!record.detail} onClick={() => setDetailRecord(record)}>
          {t('audit.viewDetail')}
        </Button>
      ),
    },
  ];

  return (
    <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.OPERATIONS]}>
      <div>
        <PageHeader
          title={t('audit.title')}
          extra={
            <div className="flex items-center gap-2">
              <Button icon={<DownloadOutlined />} onClick={handleExport}>{t('report.exportExcel')}</Button>
              <Segmented
                value={viewMode}
                onChange={(v) => setViewMode(v as 'list' | 'stats')}
                options={[
                  { value: 'list', icon: <UnorderedListOutlined />, label: t('audit.title') },
                  { value: 'stats', icon: <BarChartOutlined />, label: t('audit.statsMode') },
                ]}
              />
            </div>
          }
        />

        {viewMode === 'stats' && (
          <div className="space-y-4">
            {failLogs.length > 0 && (
              <Card
                title={<span className="flex items-center gap-2 text-red-500"><WarningOutlined />{t('audit.failedOps', { count: failLogs.length })}</span>}
                className="border-red-200"
              >
                <div className="space-y-1">
                  {failLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 rounded bg-red-50 p-2 text-sm">
                      <span className="text-text-tertiary">{formatDateTime(log.createdAt)}</span>
                      <span className="font-medium">{log.operatorName}</span>
                      <Tag color="red">{AuditActionLabelKeys[log.action as keyof typeof AuditActionLabelKeys] ? t(AuditActionLabelKeys[log.action as keyof typeof AuditActionLabelKeys]) : log.action}</Tag>
                      <span className="text-text-secondary">{log.targetResource}</span>
                      <span className="ml-auto text-text-tertiary">{log.ipAddress}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title={t('audit.moduleDistribution')}>
                  <EChart
                    option={{
                      tooltip: { trigger: 'item' as const },
                      series: [{
                        type: 'pie' as const,
                        radius: '65%',
                        data: Object.entries(moduleCounts).map(([name, value]) => ({
                          name: AuditModuleLabelKeys[name as keyof typeof AuditModuleLabelKeys] ? t(AuditModuleLabelKeys[name as keyof typeof AuditModuleLabelKeys]) : name,
                          value,
                        })),
                      }],
                    }}
                    style={{ height: 260 }}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={t('audit.actionDistribution')}>
                  <EChart
                    option={{
                      tooltip: { trigger: 'axis' as const },
                      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                      xAxis: { type: 'category' as const, data: Object.keys(actionCounts).map((k) => AuditActionLabelKeys[k as keyof typeof AuditActionLabelKeys] ? t(AuditActionLabelKeys[k as keyof typeof AuditActionLabelKeys]) : k) },
                      yAxis: { type: 'value' as const },
                      series: [{ type: 'bar' as const, data: Object.values(actionCounts), itemStyle: { color: '#1677ff' } }],
                    }}
                    style={{ height: 260 }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {viewMode === 'list' && <>
        <SearchFilterBar onSearch={handleSearch} onReset={onReset}>
          <Form.Item name="module">
            <Select allowClear placeholder={t('audit.module')} style={{ width: 120 }} options={moduleOptions} />
          </Form.Item>
          <Form.Item name="action">
            <Select allowClear placeholder={t('audit.action')} style={{ width: 120 }} options={actionOptions} />
          </Form.Item>
          <Form.Item name="keyword">
            <Input allowClear placeholder={t('audit.keyword')} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="dateRange">
            <RangePicker />
          </Form.Item>
        </SearchFilterBar>

        <DataTable<AuditLog>
          columns={columns}
          dataSource={data}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          scroll={{ x: 1100 }}
          rowClassName={(record: AuditLog) => record.result === AuditResult.FAILURE ? 'bg-red-50 hover:bg-red-100' : ''}
        />

        <AuditDetailModal
          open={!!detailRecord}
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
        />
        </>}
      </div>
    </PermissionGuard>
  );
}
