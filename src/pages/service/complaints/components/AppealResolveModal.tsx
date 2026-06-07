import { Modal, Form, Input, Radio } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { getMessageApi } from '@/utils/antd';

interface AppealResolveModalProps {
  open: boolean;
  complaintId: string;
  appealId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppealResolveModal({ open, complaintId, appealId, onClose, onSuccess }: AppealResolveModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await complaintService.resolveAppeal(complaintId, appealId, values);
      getMessageApi()?.success(t('service.resolveSuccess'));
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
      title={t('service.resolveAppealTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="accepted" label={t('service.accepted')} rules={[{ required: true, message: '请选择是否成立' }]}>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="opinion" label={t('service.opinion')} rules={[{ required: true, message: '请输入处理意见' }]}>
          <Input.TextArea rows={4} placeholder="请输入处理意见" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
