import { useCallback } from 'react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

interface ConfirmOptions {
  title?: string;
  content: string;
  type?: 'confirm' | 'warning' | 'danger';
  okText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      const { title = t('common.confirmAction'), content, type = 'confirm', okText = t('common.confirm'), cancelText = t('common.cancel') } = options;
      const method = type === 'danger' ? modal.confirm : type === 'warning' ? modal.warning : modal.confirm;

      return new Promise((resolve) => {
        method({
          title,
          content,
          okText,
          cancelText,
          okButtonProps: type === 'danger' ? { danger: true } : undefined,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    },
    [modal, t],
  );

  return { confirm };
}
