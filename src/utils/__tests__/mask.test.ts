import { describe, it, expect } from 'vitest';
import { maskPhone, maskIdCard } from '../mask';

describe('maskPhone', () => {
  it('masks middle 4 digits of a phone number', () => {
    expect(maskPhone('13800138000')).toBe('138****8000');
  });

  it('returns dash for null/undefined', () => {
    expect(maskPhone(null)).toBe('-');
    expect(maskPhone(undefined)).toBe('-');
  });

  it('returns original for short numbers', () => {
    expect(maskPhone('12345')).toBe('12345');
  });
});

describe('maskIdCard', () => {
  it('masks middle digits of an 18-digit ID card', () => {
    const result = maskIdCard('110101199001011234');
    expect(result).toBe('110***********1234');
  });

  it('returns dash for null/undefined', () => {
    expect(maskIdCard(null)).toBe('-');
    expect(maskIdCard(undefined)).toBe('-');
  });

  it('returns original for very short strings', () => {
    expect(maskIdCard('abc')).toBe('abc');
  });
});
