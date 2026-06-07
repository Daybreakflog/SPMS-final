import { useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import FormDrawer from '@/components/FormDrawer';
import { billingService } from '@/services/billing.service';
import { getMessageApi } from '@/utils/antd';
import { billSchema } from '@/schemas/bill.schema';
import { zodFieldRule } from '@/utils/zodValidator';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillFormDrawer({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      await billingService.billManualCreate({
        renterId: values.renterId as string,
        renterName: values.renterName as string,
        unitId: values.unitId as string,
        unitNumber: values.unitNumber as string,
        feeItemId: values.feeItemId as string,
        feeItemName: values.feeItemName as string,
        period: dayjs(values.period as string).format('YYYY-MM'),
        amount: values.amount as number,
        dueDate: values.dueDate ? dayjs(values.dueDate as string).format('YYYY-MM-DD') : undefined,
        remark: values.remark as string,
      });
      getMessageApi()?.success(t('common.saveSuccess'));
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={t('billing.createBill')}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      form={form}
      width={520}
      submitting={submitting}
    >
      <Form.Item name="renterId" label={t('billing.renter')} rules={[{ required: true }]}>
        <Select placeholder={t('billing.selectRenter')} showSearch optionFilterProp="label">
          <Select.Option value="renter-001" label="张伟">张伟</Select.Option>
          <Select.Option value="renter-002" label="李芳">李芳</Select.Option>
          <Select.Option value="renter-003" label="王娜">王娜</Select.Option>
          <Select.Option value="renter-004" label="刘秀英">刘秀英</Select.Option>
          <Select.Option value="renter-005" label="陈敏">陈敏</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="unitId" label={t('billing.unit_label')} rules={[{ required: true }]}>
        <Select placeholder={t('billing.selectUnit')}>
          <Select.Option value="unit-001">101</Select.Option>
          <Select.Option value="unit-002">102</Select.Option>
          <Select.Option value="unit-003">201</Select.Option>
          <Select.Option value="unit-004">202</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="feeItemId" label={t('billing.feeItem')} rules={[{ required: true }]}>
        <Select placeholder={t('billing.selectFeeItem')}>
          <Select.Option value="fi-001">物业管理费</Select.Option>
          <Select.Option value="fi-002">租金</Select.Option>
          <Select.Option value="fi-003">电费</Select.Option>
          <Select.Option value="fi-004">水费</Select.Option>
          <Select.Option value="fi-005">停车费</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="period" label={t('billing.period')} rules={[{ required: true }]}>
        <DatePicker picker="month" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="amount" label={t('billing.amount')} rules={[{ required: true }, zodFieldRule(billSchema.shape.amount)]}>
        <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
      </Form.Item>
      <Form.Item name="dueDate" label={t('billing.dueDate')}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="remark" label={t('common.remark')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </FormDrawer>
  );
}
