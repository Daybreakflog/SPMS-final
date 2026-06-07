import { Modal, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { repairService } from '@/services/repair.service';
import { getMessageApi } from '@/utils/antd';

interface CompleteModalProps {
  open: boolean;
  repairId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteModal({ open, repairId, onClose, onSuccess }: CompleteModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await repairService.complete(repairId, values);
      getMessageApi()?.success(t('service.completeSuccess'));
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
      title={t('service.completeTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="summary" label={t('service.summary')} rules={[{ required: true, message: '请输入完成总结' }]}>
          <Input.TextArea rows={4} placeholder="请输入维修完成总结..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
