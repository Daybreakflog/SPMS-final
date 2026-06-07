import { useMemo, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { contractService } from '@/services/contract.service';
import { renterService } from '@/services/renter.service';
import { PaymentCycle } from '@/types/enums';
import { PaymentCycleLabelKeys } from '@/constants/status';
import type { Contract } from '@/types';
import { getMessageApi } from '@/utils/antd';
import { contractSchema } from '@/schemas/contract.schema';
import { zodFieldRule } from '@/utils/zodValidator';
import { STALE_TIME, GC_TIME } from '@/constants/queryConfig';
import { useFormDraft } from '@/hooks/useFormDraft';

const { TextArea } = Input;

interface ContractFormDrawerProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractFormDrawer({ open, contract, onClose, onSuccess }: ContractFormDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!contract;

  const { clearDraft } = useFormDraft('contract-form', {
    getValues: () => form.getFieldsValue(),
    setValues: (values) => form.setFieldsValue(values),
  });

  const { data: renters = [], isLoading: renterLoading } = useQuery({
    queryKey: ['contract-form-renters'],
    queryFn: () => renterService.list({ page: 1, pageSize: 200 }).then((r) => r.items),
    enabled: open,
    staleTime: STALE_TIME.STATIC,
    gcTime: GC_TIME.STATIC,
  });

  const initialValues = useMemo(() => {
    if (!contract) return { paymentCycle: PaymentCycle.MONTHLY };
    return {
      ...contract,
      startDate: contract.startDate ? dayjs(contract.startDate) : undefined,
      endDate: contract.endDate ? dayjs(contract.endDate) : undefined,
    };
  }, [contract]);

  const startDate = Form.useWatch('startDate', form);
  const endDate = Form.useWatch('endDate', form);

  const leasePeriod = useMemo(() => {
    if (!startDate || !endDate) return '';
    const s = dayjs(startDate);
    const e = dayjs(endDate);
    const months = e.diff(s, 'month');
    return `${months} ${t('contract.months')}`;
  }, [startDate, endDate, t]);

  const handleRenterChange = (renterId: string) => {
    const renter = renters.find((r) => r.id === renterId);
    if (renter) {
      form.setFieldsValue({
        renterName: renter.name,
        renterIdNumber: renter.idNumber,
      });
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        startDate: dayjs(values.startDate as string).format('YYYY-MM-DD'),
        endDate: dayjs(values.endDate as string).format('YYYY-MM-DD'),
      };
      if (isEdit) {
        await contractService.update(contract!.id, payload as Parameters<typeof contractService.update>[1]);
      } else {
        await contractService.create(payload as Parameters<typeof contractService.create>[0]);
      }
      getMessageApi()?.success(t('common.saveSuccess'));
      clearDraft();
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={isEdit ? t('contract.editTitle') : t('contract.createTitle')}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      form={form}
      width={640}
      submitting={submitting}
      initialValues={initialValues}
    >
      <Divider titlePlacement="left">{t('contract.partyB')}</Divider>
      <Form.Item name="renterId" label={t('contract.renter')} rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="请选择租户"
          loading={renterLoading}
          optionFilterProp="label"
          onChange={handleRenterChange}
          options={renters.map((r) => ({ label: `${r.name} (${r.phone})`, value: r.id }))}
        />
      </Form.Item>
      <Form.Item name="renterName" hidden><Input /></Form.Item>
      <Form.Item name="renterIdNumber" label={t('contract.renterIdNumber')}>
        <Input disabled />
      </Form.Item>

      <Divider titlePlacement="left">{t('contract.leaseTarget')}</Divider>
      <Form.Item name="unitId" label={t('contract.unit')} rules={[{ required: true }]}>
        <Input placeholder="单元 ID" />
      </Form.Item>
      <Form.Item name="unitNumber" label="单元号">
        <Input placeholder="单元号" />
      </Form.Item>
      <Form.Item name="buildingName" label={t('contract.building')}>
        <Input placeholder="楼栋名" />
      </Form.Item>
      <Form.Item name="projectId" label={t('contract.project')}>
        <Input placeholder="项目 ID" />
      </Form.Item>

      <Divider titlePlacement="left">{t('contract.leaseTerms')}</Divider>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item name="startDate" label={t('contract.startDate')} rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={t('contract.endDate')}
          dependencies={['startDate']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('startDate');
                if (!value || !start || dayjs(value).isAfter(dayjs(start))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('contract.endDateAfterStart')));
              },
            }),
          ]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
      </div>
      {leasePeriod && (
        <div className="mb-4 text-sm text-text-secondary">
          {t('contract.leasePeriod')}：{leasePeriod}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item name="monthlyRent" label={t('contract.monthlyRent')} rules={[{ required: true }, zodFieldRule(contractSchema.shape.monthlyRent)]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" />
        </Form.Item>
        <Form.Item name="deposit" label={t('contract.deposit')} rules={[{ required: true }, zodFieldRule(contractSchema.shape.deposit)]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" />
        </Form.Item>
      </div>
      <Form.Item name="paymentCycle" label={t('contract.paymentCycle')} rules={[{ required: true }]}>
        <Select
          options={Object.entries(PaymentCycleLabelKeys).map(([value, key]) => ({ value, label: t(key) }))}
        />
      </Form.Item>

      <Divider titlePlacement="left">{t('contract.remark')}</Divider>
      <Form.Item name="remark" label={t('contract.remark')}>
        <TextArea rows={3} placeholder="备注信息" />
      </Form.Item>
    </FormDrawer>
  );
}
