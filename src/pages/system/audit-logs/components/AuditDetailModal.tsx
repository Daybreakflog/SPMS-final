import { useMemo } from 'react';
import { Modal, Table, Tag, Timeline, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import StatusTag from '@/components/StatusTag';
import { AuditModuleLabelKeys, AuditActionLabelKeys, AuditResultMeta } from '@/constants/status';
import { AuditResult } from '@/types/enums';
import { formatDateTime } from '@/utils/format';
import type { AuditLog } from '@/types';

interface Props {
  open: boolean;
  record: AuditLog | null;
  onClose: () => void;
}

interface DiffRow {
  field: string;
  before: unknown;
  after: unknown;
  changed: boolean;
}

interface ParsedDetail {
  diffRows: DiffRow[] | null;
  raw: string;
}

function toDisplay(v: unknown): string {
  if (v === undefined) return '-';
  if (v === null) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function parseDetail(detail?: string): ParsedDetail {
  if (!detail) return { diffRows: null, raw: '' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(detail);
  } catch {
    return { diffRows: null, raw: detail };
  }

  const obj = parsed as Record<string, unknown>;
  const hasOld = obj && typeof obj === 'object' && 'old' in obj;
  const hasNew = obj && typeof obj === 'object' && 'new' in obj;

  const raw = JSON.stringify(parsed, null, 2);

  if (!hasOld && !hasNew) {
    return { diffRows: null, raw };
  }

  const oldObj = (hasOld ? obj.old : {}) as Record<string, unknown>;
  const newObj = (hasNew ? obj.new : {}) as Record<string, unknown>;
  const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

  const diffRows: DiffRow[] = keys.map((field) => {
    const before = oldObj[field];
    const after = newObj[field];
    return {
      field,
      before,
      after,
      changed: JSON.stringify(before) !== JSON.stringify(after),
    };
  });

  return { diffRows, raw };
}

export default function AuditDetailModal({ open, record, onClose }: Props) {
  const { t } = useTranslation();

  const { diffRows, raw } = useMemo(() => parseDetail(record?.detail), [record]);

  const columns: TableColumnsType<DiffRow> = [
    { title: t('audit.diffField'), dataIndex: 'field', width: 140 },
    {
      title: t('audit.diffBefore'),
      dataIndex: 'before',
      render: (v: unknown, row) => (
        <span className={row.changed ? 'text-red-500 line-through' : ''}>{toDisplay(v)}</span>
      ),
    },
    {
      title: t('audit.diffAfter'),
      dataIndex: 'after',
      render: (v: unknown, row) => (
        <span className={row.changed ? 'font-medium text-green-600' : ''}>{toDisplay(v)}</span>
      ),
    },
  ];

  return (
    <Modal title={t('audit.detailTitle')} open={open} onCancel={onClose} footer={null} width={680} destroyOnHidden>
      {record && (
        <Timeline
          className="mb-4"
          items={[
            {
              color: 'blue',
              children: (
                <div className="text-sm">
                  <span className="text-text-tertiary">{formatDateTime(record.createdAt)}</span>
                  <span className="mx-2">·</span>
                  <span className="font-medium">{record.operatorName}</span>
                  <span className="mx-2">·</span>
                  <Tag>{AuditModuleLabelKeys[record.module as keyof typeof AuditModuleLabelKeys] ? t(AuditModuleLabelKeys[record.module as keyof typeof AuditModuleLabelKeys]) : record.module}</Tag>
                  <Tag color="blue">{AuditActionLabelKeys[record.action as keyof typeof AuditActionLabelKeys] ? t(AuditActionLabelKeys[record.action as keyof typeof AuditActionLabelKeys]) : record.action}</Tag>
                  <StatusTag status={record.result as AuditResult} statusMap={AuditResultMeta} />
                </div>
              ),
            },
            {
              color: record.result === AuditResult.SUCCESS ? 'green' : 'red',
              children: (
                <div className="text-sm">
                  <span className="text-text-secondary">{record.targetResource}</span>
                  <span className="ml-2 text-text-tertiary">IP: {record.ipAddress}</span>
                </div>
              ),
            },
          ]}
        />
      )}

      {diffRows ? (
        <Table<DiffRow>
          columns={columns}
          dataSource={diffRows}
          rowKey="field"
          size="small"
          pagination={false}
          rowClassName={(row) => (row.changed ? 'bg-primary/5' : '')}
        />
      ) : raw ? (
        <pre className="max-h-[360px] overflow-auto rounded bg-fill-quaternary p-4 text-sm">{raw}</pre>
      ) : (
        <Empty description={t('audit.noDetail')} />
      )}
    </Modal>
  );
}
