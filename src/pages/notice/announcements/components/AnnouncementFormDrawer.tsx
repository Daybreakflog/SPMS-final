import { Form, Input, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { announcementService } from '@/services/announcement.service';
import { projectService } from '@/services/project.service';
import { useProjectStore } from '@/store/project.store';
import type { Announcement, Project, AnnouncementCreateDTO } from '@/types';
import { getMessageApi } from '@/utils/antd';

interface AnnouncementFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: Announcement;
}

export default function AnnouncementFormDrawer({ open, onClose, onSuccess, editingItem }: AnnouncementFormDrawerProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const currentProject = useProjectStore((s) => s.currentProject);

  useEffect(() => {
    if (!open) return;
    projectService.list({ page: 1, pageSize: 200 }).then((res) => setProjects(res.items));
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      // 后端 CreateAnnouncementDto 只接收 projectId / title / content / status / publish 五个字段
      const payload: AnnouncementCreateDTO = {
        projectId: values.projectId as string,
        title: values.title as string,
        content: values.content as string,
        publish: (values.publish as boolean) ?? true,
      };
      if (editingItem) {
        await announcementService.update(editingItem.id, payload);
        getMessageApi()?.success(t('announcement.updateSuccess'));
      } else {
        await announcementService.create(payload);
        getMessageApi()?.success(t('announcement.createSuccess'));
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title={editingItem ? t('announcement.editTitle') : t('announcement.createTitle')}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      initialValues={
        editingItem
          ? {
              projectId: editingItem.projectId,
              title: editingItem.title,
              content: editingItem.content,
              publish: true,
            }
          : {
              projectId: currentProject?.id,
              publish: true,
            }
      }
    >
      <Form.Item name="projectId" label={t('announcement.selectProjects')} rules={[{ required: true, message: '请选择项目' }]}>
        <Select
          placeholder="请选择项目"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>
      <Form.Item name="title" label={t('announcement.announcementTitle')} rules={[{ required: true, message: '请输入标题' }]}>
        <Input placeholder="请输入公告标题" />
      </Form.Item>
      <Form.Item name="content" label={t('announcement.content')} rules={[{ required: true, message: '请输入公告内容' }]}>
        <Input.TextArea rows={8} placeholder="请输入公告内容" />
      </Form.Item>
      <Form.Item name="publish" label="发布状态" valuePropName="checked" extra="勾选后立即推送到租户端；不勾则保留为草稿">
        <Switch checkedChildren="立即发布" unCheckedChildren="保存草稿" />
      </Form.Item>
    </FormDrawer>
  );
}
