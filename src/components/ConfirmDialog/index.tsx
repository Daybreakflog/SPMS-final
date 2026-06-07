import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  content: ReactNode;
  danger?: boolean;
  loading?: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  content,
  danger = false,
  loading = false,
  onOk,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t('common.confirmAction');

  return (
    <Modal
      open={open}
      aria-label={displayTitle}
      title={
        <span className="flex items-center gap-2">
          <ExclamationCircleOutlined className={danger ? 'text-error' : 'text-warning'} />
          {displayTitle}
        </span>
      }
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      okButtonProps={{ danger, loading }}
      onOk={onOk}
      onCancel={onCancel}
    >
      {content}
    </Modal>
  );
}
