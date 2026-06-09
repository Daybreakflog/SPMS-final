import { useEffect } from 'react';
import {
  Alert, Card, Form, Input, Switch, InputNumber, Button, Upload, Space, Tabs, message,
} from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { RoleCode } from '@/types/enums';
import { settingService, isSystemSettingsApiEnabled } from '@/services/setting.service';
import type { BasicSettingDTO, NotificationSettingDTO, SecuritySettingDTO } from '@/types/api/setting';

export default function SystemSettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [basicForm] = Form.useForm<BasicSettingDTO>();
  const [notifyForm] = Form.useForm<NotificationSettingDTO>();
  const [securityForm] = Form.useForm<SecuritySettingDTO>();

  const apiEnabled = isSystemSettingsApiEnabled();

  const { data: setting, isError: loadError } = useQuery({
    queryKey: ['system-settings'],
    queryFn: settingService.get,
    enabled: apiEnabled,
    retry: false,
  });

  useEffect(() => {
    if (setting) {
      basicForm.setFieldsValue(setting.basic);
      notifyForm.setFieldsValue(setting.notification);
      securityForm.setFieldsValue(setting.security);
    }
  }, [setting, basicForm, notifyForm, securityForm]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['system-settings'] });

  const onSaveError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    message.error(t('systemSettings.saveFailed', { defaultValue: '保存失败：{{msg}}', msg }));
  };

  const saveBasic = useMutation({
    mutationFn: (v: BasicSettingDTO) => settingService.updateBasic(v),
    onSuccess: () => { message.success(t('systemSettings.saveSuccess')); invalidate(); },
    onError: onSaveError,
  });

  const saveNotification = useMutation({
    mutationFn: (v: NotificationSettingDTO) => settingService.updateNotification(v),
    onSuccess: () => { message.success(t('systemSettings.saveSuccess')); invalidate(); },
    onError: onSaveError,
  });

  const saveSecurity = useMutation({
    mutationFn: (v: SecuritySettingDTO) => settingService.updateSecurity(v),
    onSuccess: () => { message.success(t('systemSettings.saveSuccess')); invalidate(); },
    onError: onSaveError,
  });

  const handleSaveBasic = async () => {
    const values = await basicForm.validateFields();
    saveBasic.mutate(values);
  };

  const handleSaveNotify = async () => {
    const values = await notifyForm.validateFields();
    saveNotification.mutate(values);
  };

  const handleSaveSecurity = async () => {
    const values = await securityForm.validateFields();
    saveSecurity.mutate(values);
  };

  return (
    <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN]}>
      <div>
        <PageHeader title={t('systemSettings.title')} />

        {!apiEnabled && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={t('systemSettings.apiUnavailableTitle', {
              defaultValue: '系统设置接口暂未开放',
            })}
            description={t('systemSettings.apiUnavailableDesc', {
              defaultValue:
                '后端尚未提供 /api/system/settings 接口，本页内容仅为占位。开启此功能需后端实现并将环境变量 VITE_SYSTEM_SETTINGS_ENABLED 设为 true。',
            })}
          />
        )}

        {apiEnabled && loadError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={t('systemSettings.loadFailed', {
              defaultValue: '加载系统设置失败',
            })}
          />
        )}

        <Tabs
          items={[
            {
              key: 'basic',
              label: t('systemSettings.basicInfo'),
              children: (
                <Card>
                  <Form form={basicForm} layout="vertical" style={{ maxWidth: 600 }}>
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
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saveBasic.isPending}
                        disabled={!apiEnabled}
                        onClick={handleSaveBasic}
                      >
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
                  <Form form={notifyForm} layout="vertical" style={{ maxWidth: 600 }}>
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
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saveNotification.isPending}
                        disabled={!apiEnabled}
                        onClick={handleSaveNotify}
                      >
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
                  <Form form={securityForm} layout="vertical" style={{ maxWidth: 600 }}>
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
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saveSecurity.isPending}
                        disabled={!apiEnabled}
                        onClick={handleSaveSecurity}
                      >
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
