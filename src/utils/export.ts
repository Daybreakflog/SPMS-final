import * as XLSX from 'xlsx';

interface ExportColumn {
  title: string | React.ReactNode;
  dataIndex?: string;
  key?: string;
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const exportableCols = columns.filter(
    (c) => c.dataIndex && c.dataIndex !== 'action' && c.key !== 'action',
  );

  const headers = exportableCols.map((c) =>
    typeof c.title === 'string' ? c.title : String(c.dataIndex ?? ''),
  );

  const rows = data.map((row) =>
    exportableCols.map((c) => {
      const val = row[c.dataIndex!];
      if (val == null) return '';
      return val;
    }),
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  const colWidths = headers.map((h) => ({ wch: Math.max(h.length * 2, 12) }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}
