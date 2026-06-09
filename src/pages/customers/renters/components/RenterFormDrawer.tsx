import { useState } from 'react';
import { Form, Input, Select } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import FileUpload from '@/components/FileUpload';
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
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editingRenter;

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const companyId = useUserStore.getState().user?.companyId;
      const idFrontUrls = values.idFrontUrl as string[] | undefined;
      const idBackUrls = values.idBackUrl as string[] | undefined;
      const payload: RenterCreateDTO = {
        companyId: companyId ?? '',
        name: values.name as string,
        type: (values.type as 'PERSON' | 'COMPANY' | undefined) ?? 'PERSON',
        phone: values.phone as string | undefined,
        idNumber: values.idNumber as string | undefined,
        idFrontUrl: idFrontUrls?.[0],
        idBackUrl: idBackUrls?.[0],
        creditCode: values.creditCode as string | undefined,
        contactName: values.contactName as string | undefined,
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
        type: editingRenter?.type ?? 'PERSON',
        phone: editingRenter?.phone,
        idNumber: editingRenter?.idNumber,
        idFrontUrl: editingRenter?.idFrontUrl ? [editingRenter.idFrontUrl] : [],
        idBackUrl: editingRenter?.idBackUrl ? [editingRenter.idBackUrl] : [],
        creditCode: editingRenter?.creditCode,
        contactName: editingRenter?.contactName,
        remark: editingRenter?.remark,
      }
    : { type: 'PERSON' };

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
      <Form.Item name="type" label="类型" rules={[{ required: true }]}>
        <Select
          options={[
            { value: 'PERSON', label: '个人' },
            { value: 'COMPANY', label: '企业' },
          ]}
        />
      </Form.Item>
      <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }, zodFieldRule(renterSchema.shape.name)]}>
        <Input placeholder="个人租户填姓名，企业租户填公司名称" />
      </Form.Item>
      <Form.Item name="idNumber" label="身份证号">
        <Input placeholder="个人租户填身份证号" />
      </Form.Item>
      <Form.Item name="idFrontUrl" label="证件正面">
        <FileUpload maxCount={1} accept="image/*" />
      </Form.Item>
      <Form.Item name="idBackUrl" label="证件背面">
        <FileUpload maxCount={1} accept="image/*" />
      </Form.Item>
      <Form.Item name="creditCode" label="统一社会信用代码">
        <Input placeholder="企业租户填信用代码" />
      </Form.Item>

      <div className="mb-3 mt-4 text-sm font-medium text-text-secondary">联系方式</div>
      <Form.Item name="contactName" label="联系人">
        <Input placeholder="企业租户的对接联系人" />
      </Form.Item>
      <Form.Item name="phone" label="手机号" rules={[zodFieldRule(renterSchema.shape.phone)]}>
        <Input placeholder="请输入手机号" />
      </Form.Item>

      <div className="mb-3 mt-4 text-sm font-medium text-text-secondary">其他信息</div>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
