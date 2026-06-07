import { formatMoney } from '@/utils/format';

interface MoneyDisplayProps {
  value: number | undefined | null;
  prefix?: string;
  decimals?: number;
  className?: string;
  highlight?: boolean;
}

export default function MoneyDisplay({
  value,
  prefix = '¥',
  decimals = 2,
  className = '',
  highlight = false,
}: MoneyDisplayProps) {
  const formatted = formatMoney(value, { prefix, decimals });
  const colorClass = highlight && value != null && value > 0 ? 'text-error' : '';

  return <span className={`font-mono ${colorClass} ${className}`}>{formatted}</span>;
}
