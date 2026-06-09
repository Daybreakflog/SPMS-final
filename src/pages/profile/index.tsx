import { useState } from 'react';
import { Card, Descriptions, Tag, Space, Button, Form, Input } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { useUserStore } from '@/store/user.store';
import { userService } from '@/services/user.service';
import { RoleLabels, RoleColors } from '@/constants/roles';
import { RoleCode } from '@/types/enums';
import { getMessageApi } from '@/utils/antd';
import AppTour from '@/components/AppTour';
import { useAppTour } from '@/components/AppTour/useAppTour';

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form] = Form.useForm();
  const tour = useAppTour();

  if (!user) return null;

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        form.setFields([{ name: 'confirmPassword', errors: ['两次密码输入不一致'] }]);
        return;
      }
      setChangingPassword(true);
      await userService.changePassword(user.id, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      getMessageApi()?.success('密码修改成功');
      form.resetFields();
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="个人中心" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="个人信息">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.realName.charAt(0)}
            </div>
            <h3 className="m-0 text-base font-medium">{user.realName}</h3>
            <p className="mb-2 text-sm text-text-secondary">@{user.username}</p>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="所属公司">{user.companyName}</Descriptions.Item>
            <Descriptions.Item label="角色">
              <Space size={4} wrap>
                {user.roles.map((r) => (
                  <Tag key={r} color={RoleColors[r as RoleCode]}>
                    {RoleLabels[r as RoleCode] ?? (typeof r === 'string' ? r : String(r))}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="授权项目数">{user.projectIds.length} 个</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={t('profile.changePassword')} extra={
          <Button icon={<QuestionCircleOutlined />} size="small" onClick={tour.restart}>
            {t('tour.restartTour')}
          </Button>
        }>
          <Form form={form} layout="vertical">
            <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6个字符' }]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={changingPassword} onClick={handleChangePassword}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <AppTour open={tour.open} onFinish={tour.finish} />
    </div>
  );
}
