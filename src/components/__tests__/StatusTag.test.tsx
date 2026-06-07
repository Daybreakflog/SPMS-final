import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusTag from '../StatusTag';
import '@/locales/i18n';

const statusMap = {
  active: { labelKey: 'status.account.active', color: 'green' },
  inactive: { labelKey: 'status.account.disabled', color: 'red' },
  pending: { labelKey: 'status.paymentOrder.pending', color: 'orange' },
} as const;

type Status = keyof typeof statusMap;

describe('StatusTag', () => {
  it('renders correct label from statusMap', () => {
    render(<StatusTag<Status> status="active" statusMap={statusMap} />);
    expect(screen.getByText('已开通')).toBeInTheDocument();
  });

  it('renders correct label for different statuses', () => {
    const { rerender } = render(
      <StatusTag<Status> status="inactive" statusMap={statusMap} />,
    );
    expect(screen.getByText('已禁用')).toBeInTheDocument();

    rerender(<StatusTag<Status> status="pending" statusMap={statusMap} />);
    expect(screen.getByText('待支付')).toBeInTheDocument();
  });

  it('renders raw status when not found in statusMap', () => {
    render(
      <StatusTag<string>
        status="unknown"
        statusMap={{} as Record<string, { labelKey: string; color: string }>}
      />,
    );
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});
