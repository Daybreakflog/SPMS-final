import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import FileUpload from '@/components/FileUpload';
import { uploadFile } from '@/api/upload';

vi.mock('@/api/upload', () => ({
  uploadFile: vi.fn(),
}));

function changeFile(input: Element, file: File) {
  fireEvent.change(input, { target: { files: [file] } });
}

describe('FileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(uploadFile).mockResolvedValue({ url: '/api/files/abc.pdf', name: 'abc.pdf' });
  });

  it('renders the upload button when below max', () => {
    renderWithProviders(<FileUpload value={[]} />);
    expect(screen.getByText('上传文件')).toBeInTheDocument();
  });

  it('renders existing files from value', () => {
    renderWithProviders(<FileUpload value={['/api/files/contract.pdf']} />);
    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
  });

  it('uploads a file and reports the new url via onChange', async () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(<FileUpload value={[]} onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    changeFile(input, new File(['x'], 'abc.pdf', { type: 'application/pdf' }));
    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['/api/files/abc.pdf']));
  });

  it('removes a file via onChange', async () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <FileUpload value={['/api/files/contract.pdf']} onChange={onChange} />,
    );
    const removeIcon = container.querySelector('.anticon-delete');
    expect(removeIcon).toBeTruthy();
    fireEvent.click(removeIcon!);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));
  });

  it('hides the upload button when max count reached', () => {
    renderWithProviders(<FileUpload value={['/api/files/a.pdf', '/api/files/b.pdf']} maxCount={2} />);
    expect(screen.queryByText('上传文件')).not.toBeInTheDocument();
  });

  it('rejects files exceeding the size limit (does not upload)', async () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <FileUpload value={[]} onChange={onChange} maxSizeMB={0} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    changeFile(input, new File(['some-bytes'], 'big.pdf', { type: 'application/pdf' }));
    await waitFor(() => expect(uploadFile).not.toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });
});
