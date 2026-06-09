import { Modal, Form, Input } from 'antd';
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
      await complaintService.close(complaintId, { remark: values.remark });
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
      <Form form={form} layout="vertical">
        <Form.Item name="remark" label={t('service.reason')} rules={[{ required: true, message: '请输入关闭说明' }]}>
          <Input.TextArea rows={4} placeholder="请输入关闭说明" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
