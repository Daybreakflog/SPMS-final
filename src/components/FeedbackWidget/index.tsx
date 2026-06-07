import { useState } from 'react';
import { FloatButton, Modal, Form, Input, Radio } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getMessageApi } from '@/utils/antd';
import { desensitize } from '@/utils/errorReporter';

type FeedbackType = 'suggestion' | 'bug';

interface FeedbackPayload {
  type: FeedbackType;
  content: string;
  contact?: string;
  url: string;
  time: string;
}

function submitFeedback(payload: FeedbackPayload) {
  // 内容脱敏后输出/上报
  const safe: FeedbackPayload = {
    ...payload,
    content: desensitize(payload.content),
    contact: payload.contact ? desensitize(payload.contact) : undefined,
  };
  console.info('[feedback]', safe);
  const endpoint = import.meta.env.VITE_FEEDBACK_URL as string | undefined;
  if (endpoint && typeof navigator.sendBeacon === 'function') {
    try {
      navigator.sendBeacon(endpoint, JSON.stringify(safe));
    } catch {
      // 忽略上报失败
    }
  }
}

/** 全局用户反馈浮窗：提交意见或 BUG */
export default function FeedbackWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    let values: { type: FeedbackType; content: string; contact?: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      submitFeedback({
        type: values.type,
        content: values.content,
        contact: values.contact,
        url: window.location.href,
        time: new Date().toISOString(),
      });
      getMessageApi()?.success(t('feedback.success'));
      form.resetFields();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatButton
        icon={<CommentOutlined />}
        type="primary"
        tooltip={t('feedback.title')}
        onClick={() => setOpen(true)}
        style={{ insetInlineEnd: 24, bottom: 96 }}
      />
      <Modal
        title={t('feedback.title')}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        confirmLoading={submitting}
        okText={t('feedback.submit')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'suggestion' }}>
          <Form.Item name="type" label={t('feedback.type')} rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="suggestion">{t('feedback.typeSuggestion')}</Radio>
              <Radio value="bug">{t('feedback.typeBug')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="content"
            label={t('feedback.content')}
            rules={[{ required: true, message: t('feedback.contentRequired') }, { max: 500 }]}
          >
            <Input.TextArea rows={4} placeholder={t('feedback.contentPlaceholder')} showCount maxLength={500} />
          </Form.Item>
          <Form.Item name="contact" label={t('feedback.contact')}>
            <Input placeholder={t('feedback.contactPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
