import { useState } from 'react';
import { Modal, Input, Form } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

interface ApprovalModalProps {
  open: boolean;
  type: 'approve' | 'reject' | 'sign' | 'terminate';
  onClose: () => void;
  onConfirm: (data: { remark?: string; reason?: string }) => Promise<void>;
}

const titleKeyMap = {
  approve: 'contract.financeApprove',
  reject: 'contract.financeReject',
  sign: 'contract.adminSign',
  terminate: 'contract.terminate',
} as const;

export default function ApprovalModal({ open, type, onClose, onConfirm }: ApprovalModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const needsReason = type === 'reject' || type === 'terminate';

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      await onConfirm(needsReason ? { reason: values.reason } : { remark: values.remark });
      form.resetFields();
      onClose();
    } catch {
      // validation error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t(titleKeyMap[type])}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {needsReason ? (
          <Form.Item
            name="reason"
            label={type === 'terminate' ? t('contract.terminateReason') : t('contract.rejectReason')}
            rules={[{ required: true, message: type === 'terminate' ? t('contract.terminateReasonRequired') : t('contract.rejectReasonRequired') }]}
          >
            <TextArea rows={3} />
          </Form.Item>
        ) : (
          <Form.Item name="remark" label={t('contract.remark')}>
            <TextArea rows={3} placeholder="备注（选填）" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
