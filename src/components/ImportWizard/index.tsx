import { useState, useMemo } from 'react';
import { Card, Steps, Button, Upload, Result, Alert, Space, Table, Descriptions } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, TableColumnsType } from 'antd';

const { Dragger } = Upload;

export interface ColumnMapping {
  field: string;
  label: string;
  required?: boolean;
}

export interface ValidationError {
  row: number;
  message: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors?: string[];
}

export interface ImportWizardProps {
  templateName: string;
  columns: ColumnMapping[];
  onDownloadTemplate: () => void;
  onValidate?: (data: Record<string, unknown>[]) => ValidationError[];
  onImport: (file: File) => Promise<ImportResult>;
  accept?: string;
  extraForm?: React.ReactNode;
}

export default function ImportWizard({
  templateName,
  onDownloadTemplate,
  onValidate,
  onImport,
  accept = '.xlsx,.xls',
  extraForm,
}: ImportWizardProps) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleDownload = () => {
    onDownloadTemplate();
    setCurrent(1);
  };

  const handleFileUpload = () => {
    if (fileList.length === 0) return;

    if (onValidate) {
      const errors = onValidate([]);
      setValidationErrors(errors);
    }
    setCurrent(2);
  };

  const handleImport = async () => {
    if (fileList.length === 0) return;
    setImporting(true);
    try {
      const res = await onImport(fileList[0].originFileObj as File);
      setResult(res);
      setCurrent(3);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setCurrent(0);
    setFileList([]);
    setResult(null);
    setValidationErrors([]);
  };

  const errorColumns: TableColumnsType<ValidationError> = useMemo(() => [
    { title: t('importWizard.row'), dataIndex: 'row', width: 80 },
    { title: t('importWizard.errorDetails'), dataIndex: 'message' },
  ], [t]);

  const steps = [
    { title: t('importWizard.stepTemplate') },
    { title: t('importWizard.stepUpload') },
    { title: t('importWizard.stepPreview') },
    { title: t('importWizard.stepResult') },
  ];

  return (
    <Card>
      <Steps current={current} items={steps} className="mb-8" />

      {current === 0 && (
        <div className="py-8 text-center">
          <p className="mb-4 text-text-secondary">{t('importWizard.downloadTemplateDesc')}</p>
          <p className="mb-4 text-sm text-text-tertiary">{templateName}</p>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            {t('importWizard.downloadTemplate')}
          </Button>
        </div>
      )}

      {current === 1 && (
        <div className="mx-auto max-w-lg py-4">
          {extraForm}
          <div className="mt-4">
            <Dragger
              fileList={fileList}
              beforeUpload={(file) => { setFileList([file as unknown as UploadFile]); return false; }}
              onRemove={() => setFileList([])}
              maxCount={1}
              accept={accept}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">{t('importWizard.uploadDragText')}</p>
              <p className="ant-upload-hint">{t('importWizard.uploadHint')}</p>
            </Dragger>
          </div>
          <div className="mt-4 text-center">
            <Space>
              <Button onClick={() => setCurrent(0)}>{t('importWizard.prevStep')}</Button>
              <Button type="primary" disabled={fileList.length === 0} onClick={handleFileUpload}>
                {t('importWizard.nextStep')}
              </Button>
            </Space>
          </div>
        </div>
      )}

      {current === 2 && (
        <div className="py-4">
          <Descriptions bordered size="small" column={3} className="mb-4">
            <Descriptions.Item label={t('importWizard.totalRows')}>
              {validationErrors.length > 0 ? validationErrors.length : '--'}
            </Descriptions.Item>
            <Descriptions.Item label={t('importWizard.validRows')}>--</Descriptions.Item>
            <Descriptions.Item label={t('importWizard.errorRows')}>
              {validationErrors.length}
            </Descriptions.Item>
          </Descriptions>

          {validationErrors.length > 0 && (
            <Alert
              type="warning"
              message={t('importWizard.errorDetails')}
              className="mb-4"
            />
          )}
          {validationErrors.length > 0 && (
            <Table
              dataSource={validationErrors}
              columns={errorColumns}
              rowKey="row"
              pagination={false}
              size="small"
              className="mb-4"
            />
          )}
          <div className="text-center">
            <Space>
              <Button onClick={() => setCurrent(1)}>{t('importWizard.prevStep')}</Button>
              <Button type="primary" loading={importing} onClick={handleImport}>
                {t('importWizard.submitImport')}
              </Button>
            </Space>
          </div>
        </div>
      )}

      {current === 3 && result && (
        <div className="py-4">
          <Result
            status={result.failed === 0 ? 'success' : 'warning'}
            title={result.failed === 0 ? t('importWizard.importSuccess') : t('importWizard.importPartial')}
            subTitle={t('importWizard.importResultDesc', { success: result.success, failed: result.failed })}
            extra={<Button type="primary" onClick={handleReset}>{t('importWizard.importAgain')}</Button>}
          />
          {result.errors && result.errors.length > 0 && (
            <Card title={t('importWizard.errorDetails')} className="mx-auto mt-4 max-w-lg">
              <Table
                dataSource={result.errors.map((e, i) => ({ key: i, row: i + 1, message: e }))}
                columns={errorColumns}
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}
