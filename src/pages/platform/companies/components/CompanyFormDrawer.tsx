import { useState } from 'react';
import { Form, Input } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { companyService } from '@/services/company.service';
import { getMessageApi } from '@/utils/antd';
import type { Company } from '@/types';

interface Props {
  open: boolean;
  editingCompany: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyFormDrawer({ open, editingCompany, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editingCompany;

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await companyService.update(editingCompany!.id, values);
      } else {
        await companyService.create(values as unknown as Parameters<typeof companyService.create>[0]);
      }
      getMessageApi()?.success('保存成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={isEdit ? '编辑物业公司' : '新建物业公司'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      initialValues={isEdit ? editingCompany : undefined}
    >
      <Form.Item name="name" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
        <Input placeholder="请输入公司名称" />
      </Form.Item>
      <Form.Item name="code" label="公司编号" rules={[{ required: true, message: '请输入公司编号' }]}>
        <Input placeholder="请输入公司编号" />
      </Form.Item>
      <Form.Item name="contact" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
        <Input placeholder="请输入联系人" />
      </Form.Item>
      <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
        <Input placeholder="请输入联系电话" />
      </Form.Item>
      <Form.Item name="address" label="地址">
        <Input placeholder="请输入地址" />
      </Form.Item>
    </FormDrawer>
  );
}
