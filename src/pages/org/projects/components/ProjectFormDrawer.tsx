import { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { projectService } from '@/services/project.service';
import { companyService } from '@/services/company.service';
import { getMessageApi } from '@/utils/antd';
import type { Project, Company } from '@/types';
import { isProjectActive } from '@/types/domain/project';

interface Props {
  open: boolean;
  editingProject: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectFormDrawer({ open, editingProject, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const isEdit = !!editingProject;

  useEffect(() => {
    if (open) {
      companyService.list({ page: 1, pageSize: 200 }).then((res) => setCompanies(res.items));
    }
  }, [open]);

  const initialValues = isEdit
    ? { ...editingProject, status: isProjectActive(editingProject!.status) ? 1 : 0 }
    : { status: 1 };

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
      initialValues={initialValues}
    >
      <Form.Item name="companyId" label="所属公司">
        <Select
          showSearch
          allowClear
          placeholder="请选择所属公司"
          optionFilterProp="label"
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
        />
      </Form.Item>
      <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
        <Input placeholder="请输入项目名称" />
      </Form.Item>
      <Form.Item name="code" label="项目编号" rules={[{ required: true, message: '请输入项目编号' }]}>
        <Input placeholder="请输入项目编号" />
      </Form.Item>
      <Form.Item name="address" label="地址">
        <Input placeholder="请输入项目地址" />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} placeholder="请输入项目描述" />
      </Form.Item>
      <Form.Item name="status" label="状态">
        <Select>
          <Select.Option value={1}>启用</Select.Option>
          <Select.Option value={0}>禁用</Select.Option>
        </Select>
      </Form.Item>
    </FormDrawer>
  );
}
