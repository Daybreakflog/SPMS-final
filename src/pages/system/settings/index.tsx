import { useState } from 'react';
import {
  Card, Form, Input, Switch, InputNumber, Button, Upload, Space, Tabs, message,
} from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { RoleCode } from '@/types/enums';

interface BasicSettings {
  systemName: string;
  logoUrl?: string;
}

interface NotificationSettings {
  emailNotify: boolean;
  smsNotify: boolean;
  pushNotify: boolean;
}

interface SecuritySettings {
  passwordMinLength: number;
  passwordExpireDays: number;
  maxLoginAttempts: number;
  lockDuration: number;
  sessionTimeout: number;
}

export default function SystemSettingsPage() {
  const { t } = useTranslation();
  const [basicForm] = Form.useForm<BasicSettings>();
  const [notifyForm] = Form.useForm<NotificationSettings>();
  const [securityForm] = Form.useForm<SecuritySettings>();
  const [saving, setSaving] = useState(false);

  const handleSaveBasic = async () => {
    const values = await basicForm.validateFields();
    setSaving(true);
    try {
      // TODO: 对接真实保存 API
      await new Promise((r) => setTimeout(r, 600));
      message.success(t('systemSettings.saveSuccess'));
      console.log('Save basic settings:', values);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotify = async () => {
    const values = await notifyForm.validateFields();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      message.success(t('systemSettings.saveSuccess'));
      console.log('Save notify settings:', values);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    const values = await securityForm.validateFields();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      message.success(t('systemSettings.saveSuccess'));
      console.log('Save security settings:', values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN]}>
      <div>
        <PageHeader title={t('systemSettings.title')} />

        <Tabs
          items={[
            {
              key: 'basic',
              label: t('systemSettings.basicInfo'),
              children: (
                <Card>
                  <Form
                    form={basicForm}
                    layout="vertical"
                    initialValues={{ systemName: '智慧物业管理系统' }}
                    style={{ maxWidth: 600 }}
                  >
                    <Form.Item
                      name="systemName"
                      label={t('systemSettings.systemName')}
                      rules={[{ required: true, message: t('systemSettings.systemNamePlaceholder') }]}
                    >
                      <Input placeholder={t('systemSettings.systemNamePlaceholder')} />
                    </Form.Item>

                    <Form.Item name="logoUrl" label={t('systemSettings.systemLogo')}>
                      <Space direction="vertical">
                        <Upload
                          accept="image/jpeg,image/png"
                          maxCount={1}
                          beforeUpload={() => false}
                          listType="picture"
                        >
                          <Button icon={<UploadOutlined />}>{t('systemSettings.uploadLogo')}</Button>
                        </Upload>
                        <span className="text-xs text-text-tertiary">{t('systemSettings.logoUploadTip')}</span>
                      </Space>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveBasic}>
                        {t('common.save')}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              ),
            },
            {
              key: 'notifications',
              label: t('systemSettings.notifications'),
              children: (
                <Card>
                  <Form
                    form={notifyForm}
                    layout="vertical"
                    initialValues={{ emailNotify: true, smsNotify: false, pushNotify: true }}
                    style={{ maxWidth: 600 }}
                  >
                    <Form.Item
                      name="emailNotify"
                      label={t('systemSettings.emailNotify')}
                      extra={t('systemSettings.emailNotifyDesc')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      name="smsNotify"
                      label={t('systemSettings.smsNotify')}
                      extra={t('systemSettings.smsNotifyDesc')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      name="pushNotify"
                      label={t('systemSettings.pushNotify')}
                      extra={t('systemSettings.pushNotifyDesc')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveNotify}>
                        {t('common.save')}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              ),
            },
            {
              key: 'security',
              label: t('systemSettings.security'),
              children: (
                <Card>
                  <Form
                    form={securityForm}
                    layout="vertical"
                    initialValues={{
                      passwordMinLength: 8,
                      passwordExpireDays: 90,
                      maxLoginAttempts: 5,
                      lockDuration: 30,
                      sessionTimeout: 30,
                    }}
                    style={{ maxWidth: 600 }}
                  >
                    <Form.Item
                      name="passwordMinLength"
                      label={t('systemSettings.passwordMinLength')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={6} max={32} style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item
                      name="passwordExpireDays"
                      label={t('systemSettings.passwordExpireDays')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={365} style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item
                      name="maxLoginAttempts"
                      label={t('systemSettings.maxLoginAttempts')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={3} max={20} style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item
                      name="lockDuration"
                      label={t('systemSettings.lockDuration')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={5} max={1440} style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item
                      name="sessionTimeout"
                      label={t('systemSettings.sessionTimeout')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={5} max={480} style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveSecurity}>
                        {t('common.save')}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
