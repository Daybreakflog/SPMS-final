import { useEffect, type ReactNode } from 'react';
import { Modal, Button, Form, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd';

interface FormDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  children: ReactNode;
  form?: FormInstance;
  width?: number;
  loading?: boolean;
  submitting?: boolean;
  initialValues?: object;
}

export default function FormDrawer({
  title,
  open,
  onClose,
  onSubmit,
  children,
  form: externalForm,
  width = 600,
  loading = false,
  submitting = false,
  initialValues,
}: FormDrawerProps) {
  const { t } = useTranslation();
  const [internalForm] = Form.useForm();
  const form = externalForm ?? internalForm;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    }
    if (!open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch {
      // validation failed — form shows errors
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      centered
      aria-label={title}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={submitting}>
          {t('common.save')}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {children}
        </Form>
      </Spin>
    </Modal>
  );
}
