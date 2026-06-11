import { useState } from 'react';
import { Form, Input, Button, Card, Divider } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/api/token';
import { useUserStore } from '@/store/user.store';
import { normalizeUser } from '@/services/user.service';
import { getMessageApi } from '@/utils/antd';
import type { LoginParams } from '@/types';

const STAFF_ACCOUNTS = [
  { username: 'platform_admin',   label: '平台管理员' },
  { username: 'xc_company_admin', label: '公司管理·星辰' },
  { username: 'lz_company_admin', label: '公司管理·绿洲' },
  { username: 'th_project_admin', label: '项目管理·天鹅湖' },
  { username: 'fc_project_admin', label: '项目管理·翡翠城' },
  { username: 'yg_project_admin', label: '项目管理·阳光' },
  { username: 'th_finance',       label: '财务·天鹅湖' },
  { username: 'fc_finance',       label: '财务·翡翠城' },
  { username: 'th_service',       label: '客服·天鹅湖' },
  { username: 'sd_service',       label: '客服·水岸' },
  { username: 'th_engineer',      label: '工程师·天鹅湖' },
  { username: 'th_ops',           label: '运营·天鹅湖' },
  { username: 'disabled_finance', label: '已禁用账号', disabled: true },
];


export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [form] = Form.useForm<LoginParams>();

  const handleSubmit = async (values: LoginParams) => {
    setLoading(true);
    try {
      const result = await authService.login(values);
      setTokens(result.accessToken, result.refreshToken);
      setUser(normalizeUser(result.user));
      getMessageApi()?.success(t('login.success'));
      navigate('/dashboard', { replace: true });
    } catch {
      // error toast handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username: string, password: string) => {
    form.setFieldsValue({ username, password });
    form.submit();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-bg-layout">
      <Card className="w-[400px] shadow-card">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-primary">{t('login.title')}</h1>
          <p className="text-text-secondary">{t('login.subtitle')}</p>
        </div>

        <Form<LoginParams>
          form={form}
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          aria-label={t('login.title')}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('login.usernameRequired') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('login.usernamePlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.passwordPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Button
            type="link"
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => setShowQuick((v) => !v)}
            className="text-xs"
          >
            {showQuick ? '收起快捷登录' : '快捷登录（测试账号）'}
          </Button>
        </Divider>

        {showQuick && (
          <div>
            <p className="mb-1.5 text-xs text-text-tertiary">员工账号 · Test@2024</p>
            <div className="flex flex-wrap gap-1.5">
              {STAFF_ACCOUNTS.map(({ username, label, disabled }) => (
                <Button
                  key={username}
                  size="small"
                  danger={disabled}
                  loading={loading}
                  onClick={() => quickLogin(username, 'Test@2024')}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
