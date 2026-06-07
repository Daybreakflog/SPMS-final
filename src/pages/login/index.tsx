import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/api/token';
import { useUserStore } from '@/store/user.store';
import { getMessageApi } from '@/utils/antd';
import type { LoginParams } from '@/types';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginParams) => {
    setLoading(true);
    try {
      const result = await authService.login(values);
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      getMessageApi()?.success(t('login.success'));
      navigate('/dashboard', { replace: true });
    } catch {
      // error toast handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-bg-layout">
      <Card className="w-[400px] shadow-card">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-primary">{t('login.title')}</h1>
          <p className="text-text-secondary">{t('login.subtitle')}</p>
        </div>

        <Form<LoginParams>
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

        <div className="text-center text-xs text-text-tertiary">
          开发环境账号: admin / admin123
        </div>
      </Card>
    </div>
  );
}
