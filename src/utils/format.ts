import dayjs from 'dayjs';

export function formatDate(value: string | Date | undefined | null, template = 'YYYY-MM-DD'): string {
  if (!value) return '-';
  return dayjs(value).format(template);
}

export function formatDateTime(value: string | Date | undefined | null): string {
  return formatDate(value, 'YYYY-MM-DD HH:mm:ss');
}

export function formatMoney(
  value: number | undefined | null,
  options: { prefix?: string; decimals?: number } = {},
): string {
  if (value == null) return '-';
  const { prefix = '¥', decimals = 2 } = options;
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${formatted}`;
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value == null) return '-';
  return `${value.toFixed(decimals)}%`;
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
}
