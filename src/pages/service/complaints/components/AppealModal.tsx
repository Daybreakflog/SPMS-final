import { Modal, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { getMessageApi } from '@/utils/antd';

interface AppealModalProps {
  open: boolean;
  complaintId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppealModal({ open, complaintId, onClose, onSuccess }: AppealModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await complaintService.appeal(complaintId, values);
      getMessageApi()?.success(t('service.appealSuccess'));
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
      title={t('service.appealTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label={t('service.reason')} rules={[{ required: true, message: '请输入申诉理由' }]}>
          <Input.TextArea rows={4} placeholder="请输入申诉理由" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
