import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/locales/i18n';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders default empty message', () => {
    render(
      <MemoryRouter>
        <EmptyState />
      </MemoryRouter>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(
      <MemoryRouter>
        <EmptyState description="Nothing here" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders 403 page for noPermission type', () => {
    render(
      <MemoryRouter>
        <EmptyState type="noPermission" />
      </MemoryRouter>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('renders error page for error type', () => {
    render(
      <MemoryRouter>
        <EmptyState type="error" />
      </MemoryRouter>,
    );
    expect(screen.getByText('出错了')).toBeInTheDocument();
  });
});
