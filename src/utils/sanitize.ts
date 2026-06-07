const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const ESCAPE_RE = /[&<>"'/]/g;

export function sanitizeHtml(input: string): string {
  return input.replace(ESCAPE_RE, (char) => ESCAPE_MAP[char] || char);
}

export function sanitizeInput(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeInput);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeInput(v)]),
    );
  }
  return value;
}
