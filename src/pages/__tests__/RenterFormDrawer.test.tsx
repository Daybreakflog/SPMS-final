import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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

import { renterService } from '@/services/renter.service';
import RenterFormDrawer from '../customers/renters/components/RenterFormDrawer';

const defaultProps = {
  open: true,
  editingRenter: null,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe('RenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(renterService.create).mockResolvedValue({ id: 'r-001' } as any);
  });

  it('默认显示个人租户字段', async () => {
    renderWithProviders(<RenterFormDrawer {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('个人租户')).toBeTruthy();
      expect(screen.getByText('身份证号')).toBeTruthy();
    });
  });

  it('切换企业租户后显示企业字段', async () => {
    renderWithProviders(<RenterFormDrawer {...defaultProps} />);
    await waitFor(() => screen.getByText('企业租户'));
    fireEvent.click(screen.getByText('企业租户'));
    await waitFor(() => {
      expect(screen.getByText('统一社会信用代码')).toBeTruthy();
      expect(screen.getByText('联系人')).toBeTruthy();
    });
  });
});
