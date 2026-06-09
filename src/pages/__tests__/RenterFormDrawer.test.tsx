import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('@/services/renter.service', () => ({
  renterService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/store/user.store', () => ({
  useUserStore: vi.fn((selector: (s: unknown) => unknown) => {
    return selector({ user: { companyId: 'company-001' } });
  }),
}));

vi.mock('@/components/FileUpload', () => ({
  default: ({ onChange }: { onChange?: (urls: string[]) => void }) => (
    <button data-testid="file-upload" onClick={() => onChange?.(['https://example.com/test.jpg'])}>
      上传
    </button>
  ),
}));

import { renterService } from '@/services/renter.service';
import RenterFormDrawer from '../customers/renters/components/RenterFormDrawer';

const defaultProps = {
  open: true,
  editingRenter: null,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe('RenterFormDrawer - 证件照片', () => {
  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(renterService.create).mockResolvedValue({ id: 'r-001' } as any);
  });

  it('渲染证件正面 FileUpload', async () => {
    renderWithProviders(<RenterFormDrawer {...defaultProps} />);
    await waitFor(() => {
      const labels = screen.getAllByText('证件正面');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('渲染证件背面 FileUpload', async () => {
    renderWithProviders(<RenterFormDrawer {...defaultProps} />);
    await waitFor(() => {
      const labels = screen.getAllByText('证件背面');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('显示 FileUpload 上传按钮', async () => {
    renderWithProviders(<RenterFormDrawer {...defaultProps} />);
    await waitFor(() => {
      const uploads = screen.getAllByTestId('file-upload');
      expect(uploads.length).toBe(2);
    });
  });

  it('编辑模式下初始化 idFrontUrl', async () => {
    const renter = {
      id: 'r-001', name: '张三', type: 'PERSON' as const,
      idFrontUrl: 'https://example.com/front.jpg',
      companyId: 'company-001',
    };
    renderWithProviders(<RenterFormDrawer {...defaultProps} editingRenter={renter} />);
    await waitFor(() => {
      expect(screen.getAllByTestId('file-upload').length).toBe(2);
    });
  });
});
