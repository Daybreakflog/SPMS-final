import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, formatPhone, formatPercent } from '../format';

describe('formatMoney', () => {
  it('formats positive value with default prefix', () => {
    expect(formatMoney(12345.6)).toBe('¥12,345.60');
  });

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('¥0.00');
  });

  it('returns dash for null/undefined', () => {
    expect(formatMoney(null)).toBe('-');
    expect(formatMoney(undefined)).toBe('-');
  });

  it('respects custom prefix and decimals', () => {
    expect(formatMoney(100, { prefix: '$', decimals: 0 })).toBe('$100');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2024-03-15T10:30:00Z')).toMatch(/2024-03-15/);
  });

  it('returns dash for null/undefined', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });
});

describe('formatPhone', () => {
  it('formats an 11-digit phone number', () => {
    expect(formatPhone('13800138000')).toBe('138 0013 8000');
  });

  it('returns dash for null', () => {
    expect(formatPhone(null)).toBe('-');
  });
});

describe('formatPercent', () => {
  it('formats a percentage value', () => {
    expect(formatPercent(85.6789)).toBe('85.7%');
  });

  it('returns dash for null', () => {
    expect(formatPercent(null)).toBe('-');
  });
});
