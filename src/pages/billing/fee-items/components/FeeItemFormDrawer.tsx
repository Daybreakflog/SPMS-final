import { useMemo, useState } from 'react';
import { Form, Input, InputNumber, Select, Radio, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { billingService } from '@/services/billing.service';
import { BillingRule, FeeItemCycle } from '@/types/enums';
import { BillingRuleLabelKeys, FeeItemCycleLabelKeys } from '@/constants/status';
import type { FeeItem } from '@/types';

interface Props {
  open: boolean;
  feeItem: FeeItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeeItemFormDrawer({ open, feeItem, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!feeItem;

  const billingRule = Form.useWatch('billingRule', form);

  const initialValues = useMemo(() => {
    if (!feeItem) return { billingRule: BillingRule.FIXED, cycle: FeeItemCycle.MONTHLY, enabled: true };
    return { ...feeItem, enabled: feeItem.status === 1 };
  }, [feeItem]);

  const handleSubmit = async (values: Record<string, unknown> & { enabled?: boolean }) => {
    setSubmitting(true);
    try {
      const { enabled, ...rest } = values;
      // ⚠ 后端 FeeItemDto 不存 unit 字段（单位由 billingRule 推导）；status 是 number 不是 'ACTIVE'/'DISABLED'
      const data = {
        ...rest,
        status: enabled ? 1 : 0,
      };

      if (isEdit) {
        await billingService.feeItemUpdate(feeItem!.id, data as Parameters<typeof billingService.feeItemUpdate>[1]);
      } else {
        await billingService.feeItemCreate(data as Parameters<typeof billingService.feeItemCreate>[0]);
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const unitLabel = billingRule === BillingRule.BY_AREA
    ? '单价（元/㎡）'
    : billingRule === BillingRule.BY_METER
      ? '单价（元/度）'
      : '固定金额（元）';

  return (
    <FormDrawer
      title={isEdit ? t('billing.editFeeItem') : t('billing.createFeeItem')}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      form={form}
      width={480}
      submitting={submitting}
      initialValues={initialValues}
    >
      <Form.Item name="name" label={t('billing.feeItemName')} rules={[{ required: true }]}>
        <Input placeholder={t('billing.feeItemNamePlaceholder')} />
      </Form.Item>
      <Form.Item name="code" label={t('billing.feeItemCode')}>
        <Input placeholder={t('billing.feeItemCodePlaceholder')} />
      </Form.Item>
      <Form.Item name="billingRule" label={t('billing.billingRule')} rules={[{ required: true }]}>
        <Radio.Group>
          {Object.entries(BillingRuleLabelKeys).map(([key, labelKey]) => (
            <Radio.Button key={key} value={key}>{t(labelKey)}</Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item name="unitPrice" label={unitLabel} rules={[{ required: true }]}>
        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="cycle" label={t('billing.cycle')} rules={[{ required: true }]}>
        <Select>
          {Object.entries(FeeItemCycleLabelKeys).map(([key, labelKey]) => (
            <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="projectId" label={t('billing.relatedProject')}>
        <Select allowClear placeholder={t('billing.allProjects')}>
          <Select.Option value="project-001">示例项目1</Select.Option>
          <Select.Option value="project-002">示例项目2</Select.Option>
          <Select.Option value="project-003">示例项目3</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="enabled" label={t('common.status')} valuePropName="checked">
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>
      <Form.Item name="remark" label={t('common.remark')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </FormDrawer>
  );
}
