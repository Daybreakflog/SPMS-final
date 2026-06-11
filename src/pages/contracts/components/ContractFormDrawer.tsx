import { useMemo, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { contractService } from '@/services/contract.service';
import { renterService } from '@/services/renter.service';
import { projectService } from '@/services/project.service';
import { propertyService } from '@/services/property.service';
import { PaymentCycle } from '@/types/enums';
import { PaymentCycleLabelKeys } from '@/constants/status';
import type { Contract } from '@/types';
import type { PropertyTreeNode } from '@/types/domain/property';
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

function flattenUnits(tree: PropertyTreeNode[]): { label: string; value: string; status: string }[] {
  const result: { label: string; value: string; status: string }[] = [];
  for (const building of tree) {
    for (const floor of building.children ?? []) {
      for (const unit of floor.children ?? []) {
        const u = unit.data as { status?: string };
        result.push({
          label: `${building.title} - ${floor.title} - ${unit.title}`,
          value: unit.id,
          status: u.status ?? 'VACANT',
        });
      }
    }
  }
  return result;
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

  const { data: projectsData, isLoading: projectLoading } = useQuery({
    queryKey: ['contract-form-projects'],
    queryFn: () => projectService.list({ page: 1, pageSize: 100 }),
    enabled: open,
    staleTime: STALE_TIME.STATIC,
    gcTime: GC_TIME.STATIC,
  });
  const projects = projectsData?.items ?? [];

  const selectedProjectId = Form.useWatch('projectId', form);

  const { data: propertyTree = [], isLoading: treeLoading } = useQuery({
    queryKey: ['contract-form-units', selectedProjectId],
    queryFn: () => propertyService.getTree(selectedProjectId),
    enabled: !!selectedProjectId,
    staleTime: STALE_TIME.STATIC,
  });

  const unitOptions = useMemo(() => {
    const units = flattenUnits(propertyTree);
    return units.filter(
      (u) => u.status === 'VACANT' || (isEdit && u.value === contract?.unitId),
    );
  }, [propertyTree, isEdit, contract?.unitId]);

  const initialValues = useMemo(() => {
    if (!contract) return { paymentMethod: PaymentCycle.MONTHLY };
    return {
      renterProfileId: contract.renterProfileId,
      projectId: contract.projectId,
      unitId: contract.unitId,
      contractNo: contract.contractNo,
      startDate: contract.startDate ? dayjs(contract.startDate) : undefined,
      endDate: contract.endDate ? dayjs(contract.endDate) : undefined,
      rentAmount: Number(contract.rentAmount),
      depositAmount: Number(contract.depositAmount),
      paymentMethod: contract.paymentMethod,
      terms: contract.terms ?? undefined,
    };
  }, [contract]);

  const startDate = Form.useWatch('startDate', form);
  const endDate = Form.useWatch('endDate', form);

  const leasePeriod = useMemo(() => {
    if (!startDate || !endDate) return '';
    const months = dayjs(endDate).diff(dayjs(startDate), 'month');
    return `${months} ${t('contract.months')}`;
  }, [startDate, endDate, t]);

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
      <Form.Item name="renterProfileId" label={t('contract.renter')} rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="请选择租户"
          loading={renterLoading}
          optionFilterProp="label"
          options={renters.map((r) => ({ label: `${r.name} (${r.phone})`, value: r.id }))}
        />
      </Form.Item>

      <Divider titlePlacement="left">{t('contract.leaseTarget')}</Divider>
      <Form.Item name="projectId" label={t('contract.project')} rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="请选择项目"
          loading={projectLoading}
          optionFilterProp="label"
          disabled={isEdit}
          onChange={() => form.setFieldValue('unitId', undefined)}
          options={projects.map((p) => ({ label: p.name, value: p.id }))}
        />
      </Form.Item>
      <Form.Item name="unitId" label={t('contract.unit')}>
        <Select
          showSearch
          allowClear
          placeholder={selectedProjectId ? '请选择房间' : '请先选择项目'}
          loading={treeLoading}
          optionFilterProp="label"
          disabled={!selectedProjectId}
          options={unitOptions.map((u) => ({
            label: u.label,
            value: u.value,
            disabled: u.status === 'OCCUPIED' && u.value !== contract?.unitId,
          }))}
        />
      </Form.Item>
      {!isEdit && (
        <Form.Item name="contractNo" label="合同编号" rules={[{ required: true, message: '请填写合同编号' }]}>
          <Input placeholder="如：XC-TH-2026-001" />
        </Form.Item>
      )}

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
        <Form.Item name="rentAmount" label={t('contract.monthlyRent')} rules={[{ required: true }, zodFieldRule(contractSchema.shape.rentAmount)]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" controls={false} />
        </Form.Item>
        <Form.Item name="depositAmount" label={t('contract.deposit')} rules={[{ required: true }, zodFieldRule(contractSchema.shape.depositAmount)]}>
          <InputNumber className="w-full" min={0} precision={2} prefix="¥" controls={false} />
        </Form.Item>
      </div>
      <Form.Item name="paymentMethod" label={t('contract.paymentCycle')} rules={[{ required: true }]}>
        <Select
          options={Object.entries(PaymentCycleLabelKeys).map(([value, key]) => ({ value, label: t(key) }))}
        />
      </Form.Item>

      <Divider titlePlacement="left">{t('contract.remark')}</Divider>
      <Form.Item name="terms" label={t('contract.remark')}>
        <TextArea rows={3} placeholder="合同条款备注" />
      </Form.Item>
    </FormDrawer>
  );
}
