import { Form, Input, Select, Radio } from 'antd';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormDrawer from '@/components/FormDrawer';
import { announcementService } from '@/services/announcement.service';
import { AnnouncementTypeLabelKeys } from '@/constants/status';
import { AnnouncementScope } from '@/types/enums';
import type { Announcement } from '@/types';
import { getMessageApi } from '@/utils/antd';

interface AnnouncementFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: Announcement;
}

const projectOptions = [
  { value: 'project-001', label: '翡翠湾花园' },
  { value: 'project-002', label: '阳光城' },
  { value: 'project-003', label: '锦绣华庭' },
];

export default function AnnouncementFormDrawer({ open, onClose, onSuccess, editingItem }: AnnouncementFormDrawerProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const defaultScope = useMemo(() => (open && editingItem) ? (editingItem.scope || 'ALL') : 'ALL', [open, editingItem]);
  const [scopeOverride, setScopeOverride] = useState<string | undefined>(undefined);
  const scope = scopeOverride ?? defaultScope;

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      if (editingItem) {
        await announcementService.update(editingItem.id, values as unknown as Parameters<typeof announcementService.update>[1]);
        getMessageApi()?.success(t('announcement.updateSuccess'));
      } else {
        await announcementService.create(values as unknown as Parameters<typeof announcementService.create>[0]);
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
      initialValues={editingItem ? {
        title: editingItem.title,
        type: editingItem.type,
        scope: editingItem.scope,
        projectIds: editingItem.projectIds,
        content: editingItem.content,
        attachment: editingItem.attachment,
      } : { scope: 'ALL' }}
    >
      <Form.Item name="title" label={t('announcement.announcementTitle')} rules={[{ required: true, message: '请输入标题' }]}>
        <Input placeholder="请输入公告标题" />
      </Form.Item>
      <Form.Item name="type" label={t('announcement.type')} rules={[{ required: true, message: '请选择公告类型' }]}>
        <Select placeholder="请选择公告类型">
          {Object.entries(AnnouncementTypeLabelKeys).map(([key, labelKey]) => (
            <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="scope" label={t('announcement.scope')} rules={[{ required: true }]}>
        <Radio.Group onChange={(e) => setScopeOverride(e.target.value)}>
          <Radio value={AnnouncementScope.ALL}>{t('announcement.scopeAll')}</Radio>
          <Radio value={AnnouncementScope.PROJECT}>{t('announcement.scopeProject')}</Radio>
        </Radio.Group>
      </Form.Item>
      {scope === AnnouncementScope.PROJECT && (
        <Form.Item name="projectIds" label={t('announcement.selectProjects')} rules={[{ required: true, message: '请选择项目' }]}>
          <Select mode="multiple" placeholder={t('announcement.selectProjects')} options={projectOptions} />
        </Form.Item>
      )}
      <Form.Item name="content" label={t('announcement.content')} rules={[{ required: true, message: '请输入公告内容' }]}>
        <Input.TextArea rows={8} placeholder="请输入公告内容" />
      </Form.Item>
      <Form.Item name="attachment" label={t('announcement.attachment')}>
        <Input placeholder="附件说明（可选）" />
      </Form.Item>
    </FormDrawer>
  );
}
