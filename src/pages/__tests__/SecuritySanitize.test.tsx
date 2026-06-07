import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '@/utils/sanitize';

describe('sanitizeInput', () => {
  it('escapes HTML special characters in strings', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  });

  it('escapes ampersand', () => {
    expect(sanitizeInput('A & B')).toBe('A &amp; B');
  });

  it('escapes double quotes', () => {
    expect(sanitizeInput('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe('it&#x27;s');
  });

  it('escapes forward slash', () => {
    expect(sanitizeInput('path/to/file')).toBe('path&#x2F;to&#x2F;file');
  });

  it('returns non-string primitives unchanged', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(true)).toBe(true);
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
  });

  it('recursively sanitizes object values', () => {
    const result = sanitizeInput({ name: '<b>Test</b>', age: 25 }) as Record<string, unknown>;
    expect(result.name).toBe('&lt;b&gt;Test&lt;&#x2F;b&gt;');
    expect(result.age).toBe(25);
  });

  it('recursively sanitizes arrays', () => {
    const result = sanitizeInput(['<a>', 'safe', '<b>']) as string[];
    expect(result[0]).toBe('&lt;a&gt;');
    expect(result[1]).toBe('safe');
    expect(result[2]).toBe('&lt;b&gt;');
  });

  it('recursively sanitizes nested objects', () => {
    const input = { user: { name: '<script>', bio: 'hello' } };
    const result = sanitizeInput(input) as typeof input;
    expect(result.user.name).toBe('&lt;script&gt;');
    expect(result.user.bio).toBe('hello');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles string with no special chars', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
  });
});
