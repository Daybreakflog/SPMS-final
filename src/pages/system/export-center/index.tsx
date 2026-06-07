import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Table, Tag, Progress, Modal, Select, Space } from 'antd';
import { DownloadOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { formatDateTime } from '@/utils/format';

type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface ExportTask {
  id: string;
  name: string;
  type: string;
  status: ExportStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

const statusColorMap: Record<ExportStatus, string> = {
  PENDING: 'default',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  FAILED: 'error',
};

let taskIdCounter = 0;

export default function ExportCenterPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<ExportTask[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [exportType, setExportType] = useState('bill');
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, []);

  const simulateExport = useCallback((task: ExportTask) => {
    const timer = setInterval(() => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id);
        if (idx === -1) {
          clearInterval(timer);
          return prev;
        }
        const current = prev[idx];
        if (current.progress >= 100) {
          clearInterval(timer);
          timersRef.current.delete(task.id);
          const updated = [...prev];
          updated[idx] = { ...current, status: 'COMPLETED', progress: 100, completedAt: new Date().toISOString() };
          return updated;
        }
        const updated = [...prev];
        const increment = Math.floor(Math.random() * 20) + 10;
        const newProgress = Math.min(current.progress + increment, 100);
        updated[idx] = {
          ...current,
          status: newProgress >= 100 ? 'COMPLETED' : 'PROCESSING',
          progress: newProgress,
          completedAt: newProgress >= 100 ? new Date().toISOString() : undefined,
        };
        return updated;
      });
    }, 800);
    timersRef.current.set(task.id, timer);
  }, []);

  const handleCreate = () => {
    const typeLabels: Record<string, string> = {
      bill: t('exportCenter.typeBill'),
      contract: t('exportCenter.typeContract'),
      renter: t('exportCenter.typeRenter'),
      repair: t('exportCenter.typeRepair'),
    };
    const newTask: ExportTask = {
      id: `export-${++taskIdCounter}`,
      name: typeLabels[exportType] || exportType,
      type: exportType,
      status: 'PROCESSING',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    simulateExport(newTask);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRetry = (task: ExportTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: 'PROCESSING' as const, progress: 0, completedAt: undefined } : t,
      ),
    );
    simulateExport({ ...task, progress: 0, status: 'PROCESSING' });
  };

  const columns = [
    {
      title: t('exportCenter.taskName'),
      dataIndex: 'name',
    },
    {
      title: t('exportCenter.status'),
      dataIndex: 'status',
      render: (status: ExportStatus) => (
        <Tag color={statusColorMap[status]}>
          {t(`exportCenter.status${status.charAt(0) + status.slice(1).toLowerCase()}`)}
        </Tag>
      ),
    },
    {
      title: t('exportCenter.progress'),
      dataIndex: 'progress',
      render: (progress: number, record: ExportTask) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'FAILED' ? 'exception' : record.status === 'COMPLETED' ? 'success' : 'active'}
        />
      ),
    },
    {
      title: t('exportCenter.createdAt'),
      dataIndex: 'createdAt',
      render: (v: string) => formatDateTime(v),
    },
    {
      title: t('common.operation'),
      render: (_: unknown, record: ExportTask) => (
        <Space>
          {record.status === 'COMPLETED' && (
            <Button type="link" size="small" icon={<DownloadOutlined />}>
              {t('exportCenter.download')}
            </Button>
          )}
          {record.status === 'FAILED' && (
            <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => handleRetry(record)}>
              {t('exportCenter.retry')}
            </Button>
          )}
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            {t('exportCenter.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('exportCenter.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('exportCenter.newExport')}
          </Button>
        }
      />

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: t('exportCenter.noTasks') }}
      />

      <Modal
        open={createOpen}
        title={t('exportCenter.newExport')}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        okText={t('exportCenter.startExport')}
      >
        <div className="py-4">
          <label className="block mb-2 text-sm font-medium">{t('exportCenter.exportType')}</label>
          <Select
            value={exportType}
            onChange={setExportType}
            className="w-full"
            options={[
              { value: 'bill', label: t('exportCenter.typeBill') },
              { value: 'contract', label: t('exportCenter.typeContract') },
              { value: 'renter', label: t('exportCenter.typeRenter') },
              { value: 'repair', label: t('exportCenter.typeRepair') },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
