import { useState } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { renterService } from '@/services/renter.service';
import { getMessageApi } from '@/utils/antd';
import { renterSchema } from '@/schemas/renter.schema';
import { zodFieldRule } from '@/utils/zodValidator';
import { IdTypeLabelKeys, GenderLabelKeys } from '@/constants/status';
import { IdType, Gender } from '@/types/enums';
import type { Renter } from '@/types';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  editingRenter: Renter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenterFormDrawer({ open, editingRenter, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editingRenter;

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        birthDate: values.birthDate ? (values.birthDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };
      if (isEdit) {
        await renterService.update(editingRenter!.id, payload as Parameters<typeof renterService.update>[1]);
      } else {
        await renterService.create(payload as Parameters<typeof renterService.create>[0]);
      }
      getMessageApi()?.success('保存成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit
    ? {
        ...editingRenter,
        birthDate: editingRenter?.birthDate ? dayjs(editingRenter.birthDate) : undefined,
      }
    : { idType: IdType.ID_CARD, gender: Gender.MALE };

  return (
    <FormDrawer
      title={isEdit ? '编辑租户' : '新建租户'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      width={640}
      initialValues={initialValues}
    >
      <div className="mb-3 text-sm font-medium text-text-secondary">基础信息</div>
      <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }, zodFieldRule(renterSchema.shape.name)]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item name="gender" label="性别">
        <Select placeholder="请选择">
          {Object.entries(GenderLabelKeys).map(([k, labelKey]) => (
            <Select.Option key={k} value={k}>{t(labelKey)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="birthDate" label="出生日期">
        <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
      </Form.Item>
      <Form.Item name="idType" label="证件类型" rules={[{ required: true, message: '请选择证件类型' }]}>
        <Select placeholder="请选择">
          {Object.entries(IdTypeLabelKeys).map(([k, labelKey]) => (
            <Select.Option key={k} value={k}>{t(labelKey)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="idNumber" label="证件号码" rules={[{ required: true, message: '请输入证件号码' }, zodFieldRule(renterSchema.shape.idNumber)]}>
        <Input placeholder="请输入证件号码" />
      </Form.Item>

      <div className="mb-3 mt-4 text-sm font-medium text-text-secondary">联系方式</div>
      <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, zodFieldRule(renterSchema.shape.phone)]}>
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item name="phoneAlt" label="备用手机" rules={[zodFieldRule(renterSchema.shape.phoneAlt)]}>
        <Input placeholder="请输入备用手机号" />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={[zodFieldRule(renterSchema.shape.email)]}>
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item name="emergencyContact" label="紧急联系人">
        <Input placeholder="姓名 + 电话" />
      </Form.Item>

      <div className="mb-3 mt-4 text-sm font-medium text-text-secondary">其他信息</div>
      <Form.Item name="company" label="工作单位">
        <Input placeholder="请输入工作单位" />
      </Form.Item>
      <Form.Item name="position" label="职务">
        <Input placeholder="请输入职务" />
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
