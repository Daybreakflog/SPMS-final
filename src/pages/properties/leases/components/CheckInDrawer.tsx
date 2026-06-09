import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import FormDrawer from '@/components/FormDrawer';
import { leaseService } from '@/services/lease.service';
import { renterService } from '@/services/renter.service';
import { projectService } from '@/services/project.service';
import { useProjectStore } from '@/store/project.store';
import { getMessageApi } from '@/utils/antd';
import type { Renter, Project } from '@/types';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInDrawer({ open, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const currentProject = useProjectStore((s) => s.currentProject);

  useEffect(() => {
    if (!open) return;
    renterService.list({ page: 1, pageSize: 200 }).then((res) => setRenters(res.items));
    projectService.list({ page: 1, pageSize: 200 }).then((res) => setProjects(res.items));
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      await leaseService.checkIn({
        projectId: values.projectId as string,
        renterProfileId: values.renterProfileId as string,
        unitId: values.unitId as string,
        checkInDate: (values.checkInDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        remark: values.remark as string | undefined,
      });
      getMessageApi()?.success('入住办理成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title="办理入住"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      width={640}
      initialValues={{ projectId: currentProject?.id }}
    >
      <Form.Item name="projectId" label="项目" rules={[{ required: true, message: '请选择项目' }]}>
        <Select
          showSearch
          placeholder="请选择项目"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          optionFilterProp="label"
        />
      </Form.Item>
      <Form.Item name="renterProfileId" label="租户" rules={[{ required: true, message: '请选择租户' }]}>
        <Select
          showSearch
          placeholder="搜索选择租户"
          options={renters.map((r) => ({ value: r.id, label: `${r.name}${r.phone ? ` - ${r.phone}` : ''}` }))}
          optionFilterProp="label"
        />
      </Form.Item>
      <Form.Item name="unitId" label="单元 ID" rules={[{ required: true, message: '请输入单元 ID' }]}>
        <Input placeholder="请输入单元 ID" />
      </Form.Item>
      <Form.Item name="checkInDate" label="入住日期" rules={[{ required: true, message: '请选择入住日期' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
