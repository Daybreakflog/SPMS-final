import { useState, type ReactNode } from 'react';
import { Button, Form, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface SearchFilterBarProps<T extends object> {
  onSearch: (values: Partial<T>) => void;
  onReset: () => void;
  children: ReactNode;
  defaultValues?: Partial<T>;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapseThreshold?: number;
}

export default function SearchFilterBar<T extends object>({
  onSearch,
  onReset,
  children,
  defaultValues,
  collapsible = true,
  defaultCollapsed = true,
}: SearchFilterBarProps<T>) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== undefined && v !== '' && v !== null),
    ) as Partial<T>;
    onSearch(cleaned);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <div className="mb-4 rounded-md bg-bg-container p-4 shadow-card" role="search" aria-label={t('common.search')}>
      <Form
        form={form}
        layout="inline"
        initialValues={defaultValues}
        className={`flex flex-wrap gap-y-3 ${collapsed && collapsible ? 'max-h-[40px] overflow-hidden' : ''}`}
        onFinish={handleSearch}
      >
        {children}
      </Form>
      <div className="mt-3 flex justify-end">
        <Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            {t('common.search')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            {t('common.reset')}
          </Button>
          {collapsible && (
            <Button type="link" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? t('common.expand') : t('common.collapse')}
              {collapsed ? <DownOutlined /> : <UpOutlined />}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
