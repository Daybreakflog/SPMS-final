import { useParams } from 'react-router-dom';
import { Descriptions, Tabs, Tag, Spin, Space, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { userService } from '@/services/user.service';
import { formatDateTime } from '@/utils/format';
import { RoleLabels, RoleColors } from '@/constants/roles';
import { RoleCode } from '@/types/enums';
export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => userService.detail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!user) {
    return <div className="text-center text-text-tertiary">用户不存在</div>;
  }

  return (
    <div>
      <PageHeader title={user.realName} subtitle="员工详情" showBack />

      <div className="flex gap-4">
        <Card className="w-64 shrink-0">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.realName.charAt(0)}
            </div>
            <h3 className="m-0 text-base font-medium">{user.realName}</h3>
            <p className="mb-2 text-sm text-text-secondary">@{user.username}</p>
            <Space size={4} wrap className="justify-center">
              {user.roles.map((r) => (
                <Tag key={r} color={RoleColors[r as RoleCode]}>
                  {RoleLabels[r as RoleCode] ?? r}
                </Tag>
              ))}
            </Space>
          </div>
        </Card>

        <div className="flex-1">
          <Tabs
            items={[
              {
                key: 'info',
                label: '基础信息',
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="用户名">{user.username}</Descriptions.Item>
                    <Descriptions.Item label="姓名">{user.realName}</Descriptions.Item>
                    <Descriptions.Item label="手机">{user.phone}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{user.email || '-'}</Descriptions.Item>
                    <Descriptions.Item label="所属公司">{user.companyName}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={user.status === 'ACTIVE' ? 'green' : 'default'}>
                        {user.status === 'ACTIVE' ? '启用' : '禁用'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">{formatDateTime(user.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{formatDateTime(user.updatedAt)}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'roles',
                label: '角色权限',
                children: (
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary">当前分配的角色：</p>
                    <Space size={8} wrap>
                      {user.roles.map((r) => (
                        <Tag key={r} color={RoleColors[r as RoleCode]} className="px-3 py-1 text-sm">
                          {RoleLabels[r as RoleCode] ?? r}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                ),
              },
              {
                key: 'projects',
                label: '授权项目',
                children: (
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary">已授权项目 ID：</p>
                    <Space size={8} wrap>
                      {user.projectIds.map((pid) => (
                        <Tag key={pid}>{pid}</Tag>
                      ))}
                      {user.projectIds.length === 0 && <span className="text-text-tertiary">暂无授权项目</span>}
                    </Space>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
