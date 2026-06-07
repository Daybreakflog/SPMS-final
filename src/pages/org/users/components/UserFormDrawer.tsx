import { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { userService } from '@/services/user.service';
import { projectService } from '@/services/project.service';
import { getMessageApi } from '@/utils/antd';
import { RoleLabels, ALL_STAFF_ROLES } from '@/constants/roles';
import type { StaffUser, Project } from '@/types';

interface Props {
  open: boolean;
  editingUser: StaffUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormDrawer({ open, editingUser, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const isEdit = !!editingUser;

  useEffect(() => {
    if (open) {
      projectService.list({ page: 1, pageSize: 200 }).then((res) => setProjects(res.items));
    }
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await userService.update(editingUser!.id, {
          realName: values.realName as string,
          phone: values.phone as string,
          email: values.email as string | undefined,
          department: values.department as string | undefined,
          status: values.status as string | undefined,
          remark: values.remark as string | undefined,
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
          : { status: 'ACTIVE' }
      }
    >
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
      <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
        <Input placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item name="email" label="邮箱">
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item name="department" label="部门">
        <Input placeholder="请输入部门" />
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
          <Select.Option value="ACTIVE">启用</Select.Option>
          <Select.Option value="DISABLED">禁用</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
