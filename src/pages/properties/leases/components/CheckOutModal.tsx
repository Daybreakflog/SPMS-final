import { useState } from 'react';
import { Modal, Form, DatePicker, Input } from 'antd';
import { leaseService } from '@/services/lease.service';
import { getMessageApi } from '@/utils/antd';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  leaseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckOutModal({ open, leaseId, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await leaseService.checkOut(leaseId, {
        checkOutDate: (values.checkOutDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        remark: values.remark as string | undefined,
      });
      getMessageApi()?.success('退租办理成功');
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
      title="办理退租"
      open={open}
      onCancel={() => { onClose(); form.resetFields(); }}
      onOk={handleSubmit}
      confirmLoading={submitting}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="checkOutDate" label="退租日期" rules={[{ required: true, message: '请选择退租日期' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注（含退租原因等）" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
