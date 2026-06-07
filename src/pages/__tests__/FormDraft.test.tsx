import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import '@/locales/i18n';

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <ConfigProvider>
        <AntApp>
          <MemoryRouter>{children}</MemoryRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

describe('useFormDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('can be imported', async () => {
    const mod = await import('@/hooks/useFormDraft');
    expect(typeof mod.useFormDraft).toBe('function');
  });

  it('returns saveDraft and clearDraft functions', async () => {
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({});
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('test-key', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    expect(typeof result.current.saveDraft).toBe('function');
    expect(typeof result.current.clearDraft).toBe('function');
  });

  it('saveDraft stores to localStorage', async () => {
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({ name: 'testVal' });
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('save-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.saveDraft();
    });
    const stored = localStorage.getItem('form-draft:save-test');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.data.name).toBe('testVal');
  });

  it('clearDraft removes from localStorage', async () => {
    localStorage.setItem('form-draft:clear-test', JSON.stringify({ data: { x: 1 }, savedAt: Date.now() }));
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({});
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('clear-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.clearDraft();
    });
    expect(localStorage.getItem('form-draft:clear-test')).toBeNull();
  });

  it('does not save empty values', async () => {
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({});
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('empty-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.saveDraft();
    });
    expect(localStorage.getItem('form-draft:empty-test')).toBeNull();
  });

  it('handles corrupted localStorage', async () => {
    localStorage.setItem('form-draft:corrupt-test', 'not-json{{{');
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({});
    const setValues = vi.fn();
    renderHook(
      () => useFormDraft('corrupt-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    expect(localStorage.getItem('form-draft:corrupt-test')).toBeNull();
  });

  it('stores savedAt timestamp', async () => {
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({ value: 'test' });
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('timestamp-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.saveDraft();
    });
    const stored = JSON.parse(localStorage.getItem('form-draft:timestamp-test')!);
    expect(stored.savedAt).toBeGreaterThan(0);
  });

  it('overwrites previous draft', async () => {
    const { useFormDraft } = await import('@/hooks/useFormDraft');
    const getValues = vi.fn().mockReturnValue({ v: 1 });
    const setValues = vi.fn();
    const { result } = renderHook(
      () => useFormDraft('overwrite-test', { getValues, setValues }),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.saveDraft();
    });
    getValues.mockReturnValue({ v: 2 });
    act(() => {
      result.current.saveDraft();
    });
    const stored = JSON.parse(localStorage.getItem('form-draft:overwrite-test')!);
    expect(stored.data.v).toBe(2);
  });
});
