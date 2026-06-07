import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../DataTable';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
];

const dataSource = [
  { id: '1', name: 'Alice', age: 25 },
  { id: '2', name: 'Bob', age: 30 },
];

describe('DataTable', () => {
  it('renders columns and data rows', () => {
    render(
      <DataTable columns={columns} dataSource={dataSource} total={2} />,
    );
    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Age').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('calls onPageChange when pagination is clicked', async () => {
    const onPageChange = vi.fn();
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      age: 20 + i,
    }));

    render(
      <DataTable
        columns={columns}
        dataSource={manyItems.slice(0, 10)}
        total={25}
        page={1}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    const page2 = screen.getByTitle('2');
    await userEvent.click(page2);
    expect(onPageChange).toHaveBeenCalledWith(2, 10);
  });

  it('does not render pagination when total is 0', () => {
    render(
      <DataTable columns={columns} dataSource={[]} total={0} />,
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders toolbar when provided', () => {
    render(
      <DataTable
        columns={columns}
        dataSource={dataSource}
        total={2}
        toolbar={<button>Add</button>}
      />,
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
