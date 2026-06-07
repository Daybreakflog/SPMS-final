import { Modal, Form, Select, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { repairService } from '@/services/repair.service';
import { getMessageApi } from '@/utils/antd';

const engineerOptions = [
  { value: 'eng-001', label: '工程师-王刚' },
  { value: 'eng-002', label: '工程师-李强' },
  { value: 'eng-003', label: '工程师-赵明' },
  { value: 'eng-004', label: '工程师-孙磊' },
  { value: 'eng-005', label: '工程师-周伟' },
];

interface AssignModalProps {
  open: boolean;
  repairId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignModal({ open, repairId, onClose, onSuccess }: AssignModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const selected = engineerOptions.find((e) => e.value === values.engineerId);
      await repairService.assign(repairId, { ...values, engineerName: selected?.label });
      getMessageApi()?.success(t('service.assignSuccess'));
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
      title={t('service.assignTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="engineerId" label={t('service.engineerId')} rules={[{ required: true, message: '请选择工程师' }]}>
          <Select placeholder="请选择工程师" options={engineerOptions} />
        </Form.Item>
        <Form.Item name="remark" label={t('common.remark')}>
          <Input.TextArea rows={3} placeholder="备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
