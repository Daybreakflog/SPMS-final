import { useMemo, useState } from 'react';
import { Form, InputNumber, DatePicker, Select, Input } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { contractService } from '@/services/contract.service';
import { PaymentCycleLabelKeys } from '@/constants/status';
import type { Contract } from '@/types';
import { getMessageApi } from '@/utils/antd';

const { TextArea } = Input;

interface RenewDrawerProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenewDrawer({ open, contract, onClose, onSuccess }: RenewDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(() => {
    if (!contract) return {};
    const originalEnd = dayjs(contract.endDate);
    const monthsDiff = dayjs(contract.endDate).diff(dayjs(contract.startDate), 'month');
    return {
      startDate: originalEnd.add(1, 'day'),
      endDate: originalEnd.add(1, 'day').add(monthsDiff, 'month'),
      monthlyRent: Number(contract.rentAmount),
      deposit: Number(contract.depositAmount),
      paymentCycle: contract.paymentMethod,
    };
  }, [contract]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!contract) return;
    setSubmitting(true);
    try {
      // 后端 RenewContractDto 字段：contractNo / rentAmount / depositAmount / paymentMethod / terms
      // remark 字段后端不接收，需让后端补或拼到 terms 里
      await contractService.renew(contract.id, {
        contractNo: (values.contractNo as string) ?? `${contract.contractNo}-R`,
        startDate: dayjs(values.startDate as string).format('YYYY-MM-DD'),
        endDate: dayjs(values.endDate as string).format('YYYY-MM-DD'),
        rentAmount: values.monthlyRent as number,
        depositAmount: values.deposit as number,
        paymentMethod: values.paymentCycle as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
        terms: values.remark as string | undefined,
      });
      getMessageApi()?.success(t('contract.renewSuccess'));
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={t('contract.renewTitle')}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      form={form}
      width={500}
      submitting={submitting}
      initialValues={initialValues}
    >
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item name="startDate" label={t('contract.startDate')} rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item name="endDate" label={t('contract.endDate')} rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item name="monthlyRent" label={t('contract.monthlyRent')} rules={[{ required: true }]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" controls={false} />
        </Form.Item>
        <Form.Item name="deposit" label={t('contract.deposit')} rules={[{ required: true }]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" controls={false} />
        </Form.Item>
      </div>
      <Form.Item name="paymentCycle" label={t('contract.paymentCycle')} rules={[{ required: true }]}>
        <Select options={Object.entries(PaymentCycleLabelKeys).map(([value, key]) => ({ value, label: t(key) }))} />
      </Form.Item>
      <Form.Item name="remark" label={t('contract.remark')}>
        <TextArea rows={3} />
      </Form.Item>
    </FormDrawer>
  );
}
