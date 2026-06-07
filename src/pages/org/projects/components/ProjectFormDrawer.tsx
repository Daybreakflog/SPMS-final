import { useState } from 'react';
import { Form, Input } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { projectService } from '@/services/project.service';
import { getMessageApi } from '@/utils/antd';
import type { Project } from '@/types';

interface Props {
  open: boolean;
  editingProject: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectFormDrawer({ open, editingProject, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!editingProject;

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await projectService.update(editingProject!.id, values);
      } else {
        await projectService.create(values as unknown as Parameters<typeof projectService.create>[0]);
      }
      getMessageApi()?.success('保存成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={isEdit ? '编辑项目' : '新建项目'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      initialValues={isEdit ? editingProject : undefined}
    >
      <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
        <Input placeholder="请输入项目名称" />
      </Form.Item>
      <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入项目地址' }]}>
        <Input placeholder="请输入项目地址" />
      </Form.Item>
      <Form.Item name="manager" label="项目负责人">
        <Input placeholder="请输入项目负责人" />
      </Form.Item>
      <Form.Item name="contactPhone" label="联系电话">
        <Input placeholder="请输入联系电话" />
      </Form.Item>
      <Form.Item name="areaUnit" label="面积单位" initialValue="㎡">
        <Input placeholder="如：㎡" />
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
