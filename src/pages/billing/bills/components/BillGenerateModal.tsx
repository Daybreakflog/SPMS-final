import { useState } from 'react';
import { Modal, Form, Select, DatePicker, Switch, Result, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { billingService } from '@/services/billing.service';
import type { BillGenerateResult } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillGenerateModal({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BillGenerateResult | null>(null);

  const handleOk = async () => {
    if (result) {
      setResult(null);
      onSuccess();
      return;
    }
    const values = await form.validateFields();
    setLoading(true);
    try {
      const res = await billingService.billGenerate({
        projectIds: values.projectIds,
        feeItemIds: values.feeItemIds,
        period: values.period?.format?.('YYYY-MM') || values.period,
        overrideExisting: values.overrideExisting || false,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('billing.generateBills')}
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={loading}
      okText={result ? t('common.confirm') : t('billing.generate')}
      width={520}
    >
      {result ? (
        <Result
          status="success"
          title={t('billing.generateSuccess')}
          subTitle={
            <Typography.Text>
              {t('billing.generateResult', { created: result.created, skipped: result.skipped })}
            </Typography.Text>
          }
        />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="projectIds" label={t('billing.projects')} rules={[{ required: true }]}>
            <Select mode="multiple" placeholder={t('billing.selectProjects')}>
              <Select.Option value="project-001">示例项目1</Select.Option>
              <Select.Option value="project-002">示例项目2</Select.Option>
              <Select.Option value="project-003">示例项目3</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="feeItemIds" label={t('billing.feeItems')} rules={[{ required: true }]}>
            <Select mode="multiple" placeholder={t('billing.selectFeeItems')}>
              <Select.Option value="fi-001">物业管理费</Select.Option>
              <Select.Option value="fi-002">租金</Select.Option>
              <Select.Option value="fi-003">电费</Select.Option>
              <Select.Option value="fi-004">水费</Select.Option>
              <Select.Option value="fi-005">停车费</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="period" label={t('billing.period')} rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="overrideExisting" label={t('billing.overrideExisting')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
