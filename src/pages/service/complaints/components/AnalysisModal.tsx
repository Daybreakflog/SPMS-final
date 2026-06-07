import { Modal, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { getMessageApi } from '@/utils/antd';

interface AnalysisModalProps {
  open: boolean;
  complaintId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnalysisModal({ open, complaintId, onClose, onSuccess }: AnalysisModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await complaintService.analyze(complaintId, values);
      getMessageApi()?.success(t('service.analyzeSuccess'));
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
      title={t('service.analysisTitle')}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnHidden
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="conclusion" label={t('service.conclusion')} rules={[{ required: true, message: '请输入分析结论' }]}>
          <Input.TextArea rows={3} placeholder="请输入分析结论" />
        </Form.Item>
        <Form.Item name="responsibility" label={t('service.responsibility')} rules={[{ required: true, message: '请输入责任认定' }]}>
          <Input.TextArea rows={3} placeholder="请输入责任认定" />
        </Form.Item>
        <Form.Item name="suggestion" label={t('service.suggestion')} rules={[{ required: true, message: '请输入整改建议' }]}>
          <Input.TextArea rows={3} placeholder="请输入整改建议" />
        </Form.Item>
        <Form.Item name="result" label={t('service.resultField')} rules={[{ required: true, message: '请输入处理结果' }]}>
          <Input.TextArea rows={3} placeholder="请输入处理结果" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
