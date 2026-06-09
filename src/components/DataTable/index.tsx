import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { Table, Pagination, Button, Checkbox, Popover, Space, Select, Tooltip, message } from 'antd';
import { SettingOutlined, UndoOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableProps, TableColumnsType } from 'antd';
import type { ColumnType } from 'antd/es/table';

interface DataTableProps<T extends object> {
  columns: TableColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  rowKey?: string | ((record: T) => string);
  toolbar?: ReactNode;
  rowSelection?: TableProps<T>['rowSelection'];
  scroll?: TableProps<T>['scroll'];
  bordered?: boolean;
  onRow?: TableProps<T>['onRow'];
  tableKey?: string;
  batchBar?: ReactNode;
  expandable?: TableProps<T>['expandable'];
  rowClassName?: TableProps<T>['rowClassName'];
}

const VIRTUAL_THRESHOLD = 200;
const VIRTUAL_SCROLL_Y = 520;

function getColKey<T>(col: ColumnType<T>, idx: number): string {
  return (col.key as string) ?? (col.dataIndex as string) ?? `col-${idx}`;
}

interface TablePrefs {
  vis?: Record<string, boolean>;
  w?: Record<string, number>;
  fixed?: Record<string, 'left' | 'right' | false>;
}

function loadAllPrefs(tableKey: string): TablePrefs {
  try {
    const raw = localStorage.getItem(`dt-prefs-${tableKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllPrefs(tableKey: string, prefs: TablePrefs) {
  localStorage.setItem(`dt-prefs-${tableKey}`, JSON.stringify(prefs));
}

function ResizableCell({
  onResize,
  width,
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  onResize?: (w: number) => void;
  width?: number;
}) {
  if (!width || !onResize) return <th {...rest}>{children}</th>;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev: MouseEvent) => onResize(Math.max(60, startW + ev.clientX - startX));
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <th {...rest} style={{ ...rest.style, position: 'relative' }}>
      {children}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30"
        onMouseDown={handleMouseDown}
      />
    </th>
  );
}

export default function DataTable<T extends object>({
  columns,
  dataSource,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  rowKey = 'id',
  toolbar,
  rowSelection,
  scroll,
  bordered = false,
  onRow,
  tableKey,
  batchBar,
  expandable,
  rowClassName,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const [prefs, setPrefs] = useState<TablePrefs>(() =>
    tableKey ? loadAllPrefs(tableKey) : {},
  );

  const hiddenCols = useMemo(() => prefs.vis ?? {}, [prefs.vis]);
  const colWidths = useMemo(() => prefs.w ?? {}, [prefs.w]);
  const colFixed = useMemo(() => prefs.fixed ?? {}, [prefs.fixed]);

  const updatePrefs = useCallback(
    (partial: Partial<TablePrefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...partial };
        if (tableKey) saveAllPrefs(tableKey, next);
        return next;
      });
    },
    [tableKey],
  );

  const toggleCol = useCallback(
    (key: string) => {
      const next = { ...hiddenCols, [key]: !hiddenCols[key] };
      updatePrefs({ vis: next });
    },
    [hiddenCols, updatePrefs],
  );

  const handleResize = useCallback(
    (key: string, w: number) => {
      const next = { ...colWidths, [key]: w };
      updatePrefs({ w: next });
    },
    [colWidths, updatePrefs],
  );

  const handleFixedChange = useCallback(
    (key: string, value: string) => {
      const fixed = value === 'left' || value === 'right' ? value : false;
      const next: Record<string, 'left' | 'right' | false> = { ...colFixed, [key]: fixed };
      updatePrefs({ fixed: next });
    },
    [colFixed, updatePrefs],
  );

  const handleReset = useCallback(() => {
    setPrefs({});
    if (tableKey) localStorage.removeItem(`dt-prefs-${tableKey}`);
  }, [tableKey]);

  const handleExportConfig = useCallback(() => {
    const blob = new Blob([JSON.stringify(prefs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-config-${tableKey ?? 'default'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prefs, tableKey]);

  const handleImportConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as TablePrefs;
          setPrefs(imported);
          if (tableKey) saveAllPrefs(tableKey, imported);
          message.success(t('common.operationSuccess'));
        } catch {
          message.error('Invalid config file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [tableKey, t]);

  const visibleColumns = useMemo(() => {
    return columns
      .filter((c, i) => !hiddenCols[getColKey(c as ColumnType<T>, i)])
      .map((c, i) => {
        const key = getColKey(c as ColumnType<T>, i);
        const w = colWidths[key] ?? (c as ColumnType<T>).width;
        const fixedVal = colFixed[key] || (c as ColumnType<T>).fixed;
        return {
          ...c,
          width: w,
          fixed: fixedVal || undefined,
          onHeaderCell: () => ({
            width: w,
            onResize: (newW: number) => handleResize(key, newW),
          }),
        } as ColumnType<T>;
      });
  }, [columns, hiddenCols, colWidths, colFixed, handleResize]);

  const enableVirtual = dataSource.length > VIRTUAL_THRESHOLD;
  const virtualScroll = useMemo<TableProps<T>['scroll']>(() => {
    if (!enableVirtual) return scroll ?? { x: 'max-content' };
    const totalWidth = visibleColumns.reduce(
      (sum, col) => sum + (Number((col as ColumnType<T>).width) || 150),
      0,
    );
    const x = typeof scroll?.x === 'number' ? scroll.x : totalWidth;
    return { x, y: VIRTUAL_SCROLL_Y };
  }, [enableVirtual, scroll, visibleColumns]);

  const colSettingsContent = (
    <div className="max-h-80 w-72 overflow-y-auto">
      {columns.map((c, i) => {
        const col = c as ColumnType<T>;
        const key = getColKey(col, i);
        const label = typeof col.title === 'string' ? col.title : key;
        return (
          <div key={key} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
            <Checkbox checked={!hiddenCols[key]} onChange={() => toggleCol(key)}>
              {label}
            </Checkbox>
            <Select
              size="small"
              value={colFixed[key] || ''}
              onChange={(v) => handleFixedChange(key, v)}
              style={{ width: 80 }}
              options={[
                { value: '', label: '-' },
                { value: 'left', label: t('common.fixedLeft') },
                { value: 'right', label: t('common.fixedRight') },
              ]}
            />
          </div>
        );
      })}
      <div className="mt-2 flex justify-between border-t border-border pt-2">
        <Space size="small">
          <Tooltip title={t('common.exportConfig')}>
            <Button size="small" icon={<ExportOutlined />} onClick={handleExportConfig} />
          </Tooltip>
          <Tooltip title={t('common.importConfig')}>
            <Button size="small" icon={<ImportOutlined />} onClick={handleImportConfig} />
          </Tooltip>
        </Space>
        <Button size="small" icon={<UndoOutlined />} onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="rounded-md bg-bg-container p-4 shadow-card" role="region" aria-label="Data table">
      {(toolbar || tableKey) && (
        <div className="mb-3 flex items-center justify-between">
          <div>{toolbar}</div>
          {tableKey && (
            <Popover content={colSettingsContent} title={t('common.columnSettings')} trigger="click" placement="bottomRight">
              <Button icon={<SettingOutlined />} size="small" />
            </Popover>
          )}
        </div>
      )}
      {batchBar}
      <Table<T>
        columns={visibleColumns as TableColumnsType<T>}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        rowSelection={rowSelection}
        expandable={expandable}
        virtual={enableVirtual}
        scroll={virtualScroll}
        bordered={bordered}
        pagination={false}
        size="middle"
        onRow={onRow}
        rowClassName={rowClassName}
        className={onRow ? '[&_.ant-table-row]:cursor-pointer' : ''}
        components={{
          header: { cell: ResizableCell },
        }}
      />
      {total > 0 && (
        <div className="mt-4 flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={onPageChange}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      )}
    </div>
  );
}
