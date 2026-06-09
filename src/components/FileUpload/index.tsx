import { useMemo } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import { uploadFile } from '@/api/upload';
import { getMessageApi } from '@/utils/antd';

interface FileUploadProps {
  /** 受控值：已上传文件的 url 列表 */
  value?: string[];
  onChange?: (urls: string[]) => void;
  /** 最大文件数，默认 5 */
  maxCount?: number;
  accept?: string;
  disabled?: boolean;
  /** 单文件大小上限（MB），默认 10 */
  maxSizeMB?: number;
}

function urlToName(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() || url);
  } catch {
    return url;
  }
}

export default function FileUpload({
  value = [],
  onChange,
  maxCount = 5,
  accept,
  disabled = false,
  maxSizeMB = 10,
}: FileUploadProps) {
  const { t } = useTranslation();

  const fileList = useMemo<UploadFile[]>(
    () =>
      value.map((url, idx) => ({
        uid: `${idx}-${url}`,
        name: urlToName(url),
        status: 'done',
        url,
      })),
    [value],
  );

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (value.length >= maxCount) {
      getMessageApi()?.warning(t('upload.maxCountReached', { count: maxCount }));
      return Upload.LIST_IGNORE;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      getMessageApi()?.warning(t('upload.maxSizeExceeded', { size: maxSizeMB }));
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await uploadFile(file as File);
      onChange?.([...value, res.url]);
      getMessageApi()?.success(t('upload.uploadSuccess'));
      onSuccess?.(res);
    } catch (err) {
      getMessageApi()?.error(t('upload.uploadFailed'));
      onError?.(err as Error);
    }
  };

  const handleRemove: UploadProps['onRemove'] = (file) => {
    const next = value.filter((url) => url !== file.url);
    onChange?.(next);
  };

  const handlePreview: UploadProps['onPreview'] = (file) => {
    if (file.url) window.open(file.url, '_blank');
  };

  return (
    <Upload
      fileList={fileList}
      accept={accept}
      disabled={disabled}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onRemove={handleRemove}
      onPreview={handlePreview}
      listType="text"
    >
      {value.length < maxCount && !disabled && (
        <Button icon={<UploadOutlined />}>{t('upload.button')}</Button>
      )}
    </Upload>
  );
}
