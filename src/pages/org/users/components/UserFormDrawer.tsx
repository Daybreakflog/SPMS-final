import { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { userService } from '@/services/user.service';
import { projectService } from '@/services/project.service';
import { companyService } from '@/services/company.service';
import { getMessageApi } from '@/utils/antd';
import { RoleLabels, ALL_STAFF_ROLES } from '@/constants/roles';
import type { StaffUser, Project, Company } from '@/types';

interface Props {
  open: boolean;
  editingUser: StaffUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormDrawer({ open, editingUser, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const isEdit = !!editingUser;

  useEffect(() => {
    if (open) {
      companyService.list({ page: 1, pageSize: 200 }).then((res) => setCompanies(res.items));
      projectService.list({ page: 1, pageSize: 200 }).then((res) => setProjects(res.items));
    }
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        // ⚠ 后端 UpdateUserDto 不存 department / remark；status 是 number 不是 string
        await userService.update(editingUser!.id, {
          realName: values.realName as string,
          phone: values.phone as string,
          companyId: values.companyId as string | undefined,
          status: values.status as number | undefined,
        });
        if (values.roles) {
          await userService.assignRoles(editingUser!.id, { roles: values.roles as [] });
        }
        if (values.projectIds) {
          await userService.assignProjects(editingUser!.id, { projectIds: values.projectIds as [] });
        }
      } else {
        await userService.create(values as unknown as Parameters<typeof userService.create>[0]);
      }
      getMessageApi()?.success('保存成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={isEdit ? '编辑员工' : '新建员工'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      width={640}
      initialValues={
        isEdit
          ? { ...editingUser }
          : { status: 1 }
      }
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
      <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder="请输入用户名" disabled={isEdit} />
      </Form.Item>
      {!isEdit && (
        <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '请输入初始密码' }]}>
          <Input.Password placeholder="请输入初始密码" />
        </Form.Item>
      )}
      <Form.Item name="realName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input placeholder="请输入真实姓名" />
      </Form.Item>
      <Form.Item name="phone" label="手机号">
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item name="roles" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
        <Select
          mode="multiple"
          placeholder="请选择角色"
          options={ALL_STAFF_ROLES.map((r) => ({ value: r, label: RoleLabels[r] }))}
        />
      </Form.Item>
      <Form.Item name="projectIds" label="授权项目">
        <Select
          mode="multiple"
          placeholder="请选择项目"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
        />
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
