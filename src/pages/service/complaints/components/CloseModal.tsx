import { Modal, Form, Input, Switch } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { getMessageApi } from '@/utils/antd';

interface CloseModalProps {
  open: boolean;
  complaintId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CloseModal({ open, complaintId, onClose, onSuccess }: CloseModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await complaintService.close(complaintId, { reason: values.reason, followUp: values.followUp ?? false });
      getMessageApi()?.success(t('service.closeSuccess'));
      form.resetFields();
      onSuccess();
    } catch {
      // validation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('service.closeTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{ followUp: false }}>
        <Form.Item name="reason" label={t('service.reason')} rules={[{ required: true, message: '请输入关闭原因' }]}>
          <Input.TextArea rows={4} placeholder="请输入关闭原因" />
        </Form.Item>
        <Form.Item name="followUp" label={t('service.followUp')} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
