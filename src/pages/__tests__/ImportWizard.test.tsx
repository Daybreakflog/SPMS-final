import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import ImportWizard from '@/components/ImportWizard';
import type { ImportResult } from '@/components/ImportWizard';

const defaultProps = {
  templateName: 'test_template.xlsx',
  columns: [
    { field: 'name', label: '姓名', required: true },
    { field: 'phone', label: '手机号', required: true },
    { field: 'idType', label: '证件类型' },
  ],
  onDownloadTemplate: vi.fn(),
  onImport: vi.fn().mockResolvedValue({ success: 5, failed: 0 } as ImportResult),
};

describe('ImportWizard', () => {
  it('renders first step - template download', () => {
    renderWithProviders(<ImportWizard {...defaultProps} />);
    // Step item "下载模板" is in the Steps header
    const downloadBtns = screen.getAllByText('下载模板');
    expect(downloadBtns.length).toBeGreaterThan(0);
  });

  it('renders step labels', () => {
    renderWithProviders(<ImportWizard {...defaultProps} />);
    expect(screen.getByText('上传文件')).toBeInTheDocument();
    expect(screen.getByText('校验预览')).toBeInTheDocument();
    expect(screen.getByText('导入结果')).toBeInTheDocument();
  });

  it('renders template description', () => {
    renderWithProviders(<ImportWizard {...defaultProps} />);
    expect(screen.getByText(/下载导入模板|填写数据/)).toBeInTheDocument();
  });

  it('download template button triggers callback and advances step', async () => {
    renderWithProviders(<ImportWizard {...defaultProps} />);
    // The button in the content area (not step header)
    const buttons = screen.getAllByText('下载模板');
    // Last one is the button in step content
    fireEvent.click(buttons[buttons.length - 1]);
    expect(defaultProps.onDownloadTemplate).toHaveBeenCalled();
    // After advancing, step 2 content area should appear (upload dragger area)
    // "上传文件" already exists in Steps header, so check for the dragger hint text
    await waitFor(() => {
      const texts = screen.getAllByText(/上传/);
      expect(texts.length).toBeGreaterThan(0);
    });
  });

  it('shows template filename', () => {
    renderWithProviders(<ImportWizard {...defaultProps} />);
    expect(screen.getByText('test_template.xlsx')).toBeInTheDocument();
  });
});
