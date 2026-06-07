import { useState } from 'react';
import { Card, Steps, Button, Form, Select, DatePicker, Upload, Result, Alert, Space, Table } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { billingService } from '@/services/billing.service';
import { RoleCode } from '@/types/enums';
import { getMessageApi } from '@/utils/antd';

const { RangePicker } = DatePicker;
const { Dragger } = Upload;

interface ImportResult {
  success: number;
  failed: number;
  errors?: string[];
}

export default function MeterReadingsPage() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDownloadTemplate = () => {
    getMessageApi()?.success(t('billing.templateDownloaded'));
  };

  const handleUpload = async () => {
    const values = await form.validateFields();
    if (fileList.length === 0) {
      getMessageApi()?.warning(t('billing.selectFile'));
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as File);
      formData.append('projectId', values.projectId);
      formData.append('feeItemId', values.feeItemId);
      if (values.periodRange) {
        formData.append('periodStart', values.periodRange[0].format('YYYY-MM-DD'));
        formData.append('periodEnd', values.periodRange[1].format('YYYY-MM-DD'));
      }
      const res = await billingService.meterReadingImport(formData);
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
    form.resetFields();
  };

  const steps = [
    { title: t('billing.stepDownload') },
    { title: t('billing.stepFillIn') },
    { title: t('billing.stepUpload') },
    { title: t('billing.stepResult') },
  ];

  return (
    <div>
      <PageHeader title={t('billing.meterReadingsTitle')} />
      <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.OPERATIONS, RoleCode.PLATFORM_ADMIN]}>
        <Card>
          <Steps current={current} items={steps} className="mb-8" />

          {current === 0 && (
            <div className="text-center py-8">
              <p className="mb-4 text-text-secondary">{t('billing.downloadTemplateDesc')}</p>
              <Button type="primary" icon={<DownloadOutlined />} onClick={() => { handleDownloadTemplate(); setCurrent(1); }}>
                {t('billing.downloadTemplate')}
              </Button>
            </div>
          )}

          {current === 1 && (
            <div className="text-center py-8">
              <Alert
                message={t('billing.fillInGuide')}
                description={t('billing.fillInGuideDesc')}
                type="info"
                showIcon
                className="mb-4 text-left max-w-lg mx-auto"
              />
              <Button type="primary" onClick={() => setCurrent(2)}>
                {t('billing.nextStep')}
              </Button>
            </div>
          )}

          {current === 2 && (
            <div className="max-w-lg mx-auto py-4">
              <Form form={form} layout="vertical">
                <Form.Item name="projectId" label={t('billing.project')} rules={[{ required: true }]}>
                  <Select placeholder={t('billing.selectProject')}>
                    <Select.Option value="project-001">示例项目1</Select.Option>
                    <Select.Option value="project-002">示例项目2</Select.Option>
                    <Select.Option value="project-003">示例项目3</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="feeItemId" label={t('billing.meterFeeItem')} rules={[{ required: true }]}>
                  <Select placeholder={t('billing.selectMeterFeeItem')}>
                    <Select.Option value="fi-003">电费</Select.Option>
                    <Select.Option value="fi-004">水费</Select.Option>
                    <Select.Option value="fi-009">天然气费</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="periodRange" label={t('billing.meterPeriod')} rules={[{ required: true }]}>
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label={t('billing.uploadFile')} required>
                  <Dragger
                    fileList={fileList}
                    beforeUpload={(file) => { setFileList([file as unknown as UploadFile]); return false; }}
                    onRemove={() => setFileList([])}
                    maxCount={1}
                    accept=".xlsx,.xls"
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">{t('billing.uploadDragText')}</p>
                    <p className="ant-upload-hint">{t('billing.uploadHint')}</p>
                  </Dragger>
                </Form.Item>
              </Form>
              <div className="text-center mt-4">
                <Space>
                  <Button onClick={() => setCurrent(1)}>{t('billing.prevStep')}</Button>
                  <Button type="primary" loading={importing} onClick={handleUpload}>
                    {t('billing.submitImport')}
                  </Button>
                </Space>
              </div>
            </div>
          )}

          {current === 3 && result && (
            <div className="py-4">
              <Result
                status={result.failed === 0 ? 'success' : 'warning'}
                title={result.failed === 0 ? t('billing.importSuccess') : t('billing.importPartial')}
                subTitle={t('billing.importResultDesc', { success: result.success, failed: result.failed })}
                extra={<Button type="primary" onClick={handleReset}>{t('billing.importAgain')}</Button>}
              />
              {result.errors && result.errors.length > 0 && (
                <Card title={t('billing.errorDetails')} className="mt-4 max-w-lg mx-auto">
                  <Table
                    dataSource={result.errors.map((e, i) => ({ key: i, error: e }))}
                    columns={[{ title: t('billing.errorInfo'), dataIndex: 'error' }]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}
            </div>
          )}
        </Card>
      </PermissionGuard>
    </div>
  );
}
