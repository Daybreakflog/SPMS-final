import { useState } from 'react';
import { Modal, Form, DatePicker, Select, Input } from 'antd';
import { leaseService } from '@/services/lease.service';
import { getMessageApi } from '@/utils/antd';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  leaseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CHECKOUT_REASONS = ['合同到期', '提前退租', '违约退租', '其他'];

export default function CheckOutModal({ open, leaseId, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await leaseService.checkOut(leaseId, {
        checkOutDate: (values.checkOutDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        reason: values.reason,
        remark: values.remark,
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
        <Form.Item name="reason" label="退租原因">
          <Select placeholder="请选择退租原因" allowClear>
            {CHECKOUT_REASONS.map((r) => (
              <Select.Option key={r} value={r}>{r}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
