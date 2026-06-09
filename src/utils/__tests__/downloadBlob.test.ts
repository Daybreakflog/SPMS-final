import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob } from '@/utils/export';

describe('downloadBlob', () => {
  const createSpy = vi.fn((): string => 'blob:mock-url');
  const revokeSpy = vi.fn();
  const clickSpy = vi.fn();

  beforeEach(() => {
    createSpy.mockClear();
    revokeSpy.mockClear();
    clickSpy.mockClear();
    // jsdom 未实现 createObjectURL / revokeObjectURL
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = createSpy;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeSpy;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => clickSpy());
  });

  afterEach(() => vi.restoreAllMocks());

  it('creates an object URL from the blob', () => {
    downloadBlob(new Blob(['data']), 'file.xlsx');
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers a click to start the download', () => {
    downloadBlob(new Blob(['data']), 'file.xlsx');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL afterwards', () => {
    downloadBlob(new Blob(['data']), 'file.xlsx');
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the download filename on the anchor', () => {
    const setSpy = vi.spyOn(document.body, 'appendChild');
    downloadBlob(new Blob(['data']), 'report-2026.csv');
    const anchor = setSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('report-2026.csv');
  });
});
