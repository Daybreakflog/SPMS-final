import { Modal, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { repairService } from '@/services/repair.service';
import { getMessageApi } from '@/utils/antd';

interface ProgressModalProps {
  open: boolean;
  repairId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProgressModal({ open, repairId, onClose, onSuccess }: ProgressModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await repairService.progress(repairId, values);
      getMessageApi()?.success(t('service.progressSuccess'));
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
      title={t('service.progressTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="description" label={t('service.description')} rules={[{ required: true, message: '请输入进度描述' }]}>
          <Input.TextArea rows={4} placeholder="请描述当前进度..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
