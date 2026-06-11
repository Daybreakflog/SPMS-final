import { useState, useEffect } from 'react';
import { Form, Input } from 'antd';
import { UserOutlined, BankOutlined } from '@ant-design/icons';
import FormDrawer from '@/components/FormDrawer';
import { renterService } from '@/services/renter.service';
import { useUserStore } from '@/store/user.store';
import { getMessageApi } from '@/utils/antd';
import { renterSchema } from '@/schemas/renter.schema';
import { zodFieldRule } from '@/utils/zodValidator';
import type { Renter, RenterCreateDTO } from '@/types';

interface Props {
  open: boolean;
  editingRenter: Renter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenterFormDrawer({ open, editingRenter, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<'PERSON' | 'COMPANY'>('PERSON');
  const isEdit = !!editingRenter;
  const isPerson = type === 'PERSON';

  useEffect(() => {
    if (open) {
      setType((editingRenter?.type ?? 'PERSON') as 'PERSON' | 'COMPANY');
    }
  }, [open, editingRenter?.type]);

  const handleTypeSwitch = (t: 'PERSON' | 'COMPANY') => {
    setType(t);
    form.resetFields(['idNumber', 'creditCode', 'contactName']);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const companyId = useUserStore.getState().user?.companyId;
      const payload: RenterCreateDTO = {
        companyId: companyId ?? '',
        name: values.name as string,
        type,
        phone: values.phone as string | undefined,
        email: values.email as string | undefined,
        idNumber: isPerson ? (values.idNumber as string | undefined) : undefined,
        creditCode: !isPerson ? (values.creditCode as string | undefined) : undefined,
        contactName: !isPerson ? (values.contactName as string | undefined) : undefined,
        remark: values.remark as string | undefined,
      };
      if (isEdit) {
        await renterService.update(editingRenter!.id, payload);
      } else {
        await renterService.create(payload);
      }
      getMessageApi()?.success('保存成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit
    ? {
        name: editingRenter?.name,
        phone: editingRenter?.phone,
        email: editingRenter?.email,
        idNumber: editingRenter?.idNumber,
        creditCode: editingRenter?.creditCode,
        contactName: editingRenter?.contactName,
        remark: editingRenter?.remark,
      }
    : {};

  return (
    <FormDrawer
      form={form}
      title={isEdit ? '编辑租户' : '新建租户'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      width={560}
      initialValues={initialValues}
    >
      <div className="mb-6 flex gap-4">
        {([
          { value: 'PERSON', icon: <UserOutlined />, title: '个人租户', desc: '自然人 / 身份证' },
          { value: 'COMPANY', icon: <BankOutlined />, title: '企业租户', desc: '公司 / 社会信用代码' },
        ] as const).map((opt) => {
          const active = type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTypeSwitch(opt.value)}
              className="flex flex-1 flex-col items-center gap-1 px-4 py-5"
              style={{
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--app-border)'}`,
                background: active ? 'var(--color-primary-bg)' : 'var(--app-bg-container)',
                color: active ? 'var(--color-primary)' : 'inherit',
                boxShadow: active
                  ? '0 10px 24px -10px rgba(22, 119, 255, 0.45)'
                  : 'var(--shadow-card)',
                transform: active ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{opt.title}</span>
              <span style={{ fontSize: 12, opacity: 0.65 }}>{opt.desc}</span>
            </button>
          );
        })}
      </div>

      <Form.Item
        name="name"
        label={isPerson ? '姓名' : '企业名称'}
        rules={[{ required: true, message: `请输入${isPerson ? '姓名' : '企业名称'}` }, zodFieldRule(renterSchema.shape.name)]}
      >
        <Input placeholder={isPerson ? '请输入租户姓名' : '请输入企业全称'} />
      </Form.Item>

      {isPerson ? (
        <Form.Item name="idNumber" label="身份证号">
          <Input placeholder="请输入身份证号" />
        </Form.Item>
      ) : (
        <>
          <Form.Item name="creditCode" label="统一社会信用代码">
            <Input placeholder="请输入统一社会信用代码" />
          </Form.Item>
          <Form.Item name="contactName" label="联系人">
            <Input placeholder="请输入对接联系人姓名" />
          </Form.Item>
        </>
      )}

      <Form.Item name="phone" label="手机号" rules={[zodFieldRule(renterSchema.shape.phone)]}>
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
