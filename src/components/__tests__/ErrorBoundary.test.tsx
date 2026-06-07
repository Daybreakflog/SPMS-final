import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

vi.mock('@/locales/i18n', () => ({
  default: {
    t: (key: string) => {
      const map: Record<string, string> = {
        'error.title': 'Something went wrong',
        'error.subtitle': 'Sorry, an error occurred',
        'error.retry': 'Retry',
        'error.backHome': 'Back to Home',
      };
      return map[key] ?? key;
    },
  },
}));

function ThrowError() {
  throw new Error('Test error');
  return null;
}

function GoodChild() {
  return <div>Hello World</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders error page when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('calls window.location.reload on retry click', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock, href: '' },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByText('Retry'));
    expect(reloadMock).toHaveBeenCalled();
  });
});
