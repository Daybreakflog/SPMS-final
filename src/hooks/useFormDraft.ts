import { useEffect, useRef, useCallback } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const DRAFT_PREFIX = 'form-draft:';

export function useFormDraft<T extends Record<string, unknown>>(
  key: string,
  options: {
    getValues: () => T;
    setValues: (values: T) => void;
    interval?: number;
  },
) {
  const { getValues, setValues, interval = 5000 } = options;
  const { t } = useTranslation();
  const restoredRef = useRef(false);
  const storageKey = DRAFT_PREFIX + key;

  const saveDraft = useCallback(() => {
    try {
      const values = getValues();
      const hasContent = Object.values(values).some(
        (v) => v !== undefined && v !== null && v !== '',
      );
      if (hasContent) {
        localStorage.setItem(storageKey, JSON.stringify({ data: values, savedAt: Date.now() }));
      }
    } catch { /* ignore */ }
  }, [getValues, storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const restoreDraft = useCallback(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const { data } = JSON.parse(raw) as { data: T; savedAt: number };
      Modal.confirm({
        title: t('formDraft.restoreTitle'),
        content: t('formDraft.restoreContent'),
        okText: t('formDraft.restore'),
        cancelText: t('formDraft.discard'),
        onOk: () => setValues(data),
        onCancel: () => clearDraft(),
      });
    } catch {
      clearDraft();
    }
  }, [storageKey, setValues, clearDraft, t]);

  useEffect(() => {
    restoreDraft();
  }, [restoreDraft]);

  useEffect(() => {
    const timer = setInterval(saveDraft, interval);
    return () => clearInterval(timer);
  }, [saveDraft, interval]);

  return { saveDraft, clearDraft };
}
