import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Input } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import '@/locales/i18n';
import SearchFilterBar from '../SearchFilterBar';

interface Filter {
  keyword: string;
}

function renderBar(onSearch = vi.fn(), onReset = vi.fn()) {
  return render(
    <MemoryRouter>
      <SearchFilterBar<Filter> onSearch={onSearch} onReset={onReset} collapsible={false}>
        <Form.Item name="keyword" label="Keyword">
          <Input placeholder="Search..." />
        </Form.Item>
      </SearchFilterBar>
    </MemoryRouter>,
  );
}

describe('SearchFilterBar', () => {
  it('calls onSearch when search button is clicked', async () => {
    const onSearch = vi.fn();
    renderBar(onSearch);

    const input = screen.getByPlaceholderText('Search...');
    await userEvent.type(input, 'test');
    await userEvent.click(screen.getByText('搜索'));

    expect(onSearch).toHaveBeenCalledWith({ keyword: 'test' });
  });

  it('calls onReset when reset button is clicked', async () => {
    const onReset = vi.fn();
    renderBar(vi.fn(), onReset);

    await userEvent.click(screen.getByText('重置'));
    expect(onReset).toHaveBeenCalled();
  });

  it('renders children form items', () => {
    renderBar();
    expect(screen.getByText('Keyword')).toBeInTheDocument();
  });
});
