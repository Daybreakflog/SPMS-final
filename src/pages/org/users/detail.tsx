import { Modal, Descriptions, Tabs, Tag, Spin, Space, Card, Timeline, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { userService, normalizeUser } from '@/services/user.service';
import { auditService } from '@/services/audit.service';
import { formatDateTime } from '@/utils/format';
import { RoleLabels, RoleColors } from '@/constants/roles';
import { RoleCode } from '@/types/enums';
import type { AuditLog } from '@/types';

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function UserDetailModal({ open, id, onClose }: Props) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => userService.detail(id),
    select: normalizeUser,
    enabled: !!id && open,
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['user-audit', id],
    queryFn: () => auditService.resourceHistory(id),
    enabled: !!id && open,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={user ? `${user.realName} - 员工详情` : '员工详情'}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !user ? (
        <div className="py-8 text-center text-text-tertiary">用户不存在</div>
      ) : (
        <div className="flex gap-4">
          <Card className="w-56 shrink-0">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {user.realName.charAt(0)}
              </div>
              <h3 className="m-0 text-base font-medium">{user.realName}</h3>
              <p className="mb-2 text-sm text-text-secondary">@{user.username}</p>
              <Space size={4} wrap className="justify-center">
                {user.roles.map((r) => (
                  <Tag key={r} color={RoleColors[r as RoleCode]}>
                    {RoleLabels[r as RoleCode] ?? (typeof r === 'string' ? r : String(r))}
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
                      <Descriptions.Item label="所属公司">{user.companyName}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Tag color={user.status === 1 ? 'green' : 'default'}>
                          {user.status === 1 ? '启用' : '禁用'}
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
                            {RoleLabels[r as RoleCode] ?? (typeof r === 'string' ? r : String(r))}
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
                {
                  key: 'audit',
                  label: '操作日志',
                  children: auditLoading ? (
                    <div className="flex h-32 items-center justify-center"><Spin /></div>
                  ) : auditLogs.length === 0 ? (
                    <Empty description="暂无操作日志" className="py-8" />
                  ) : (
                    <Timeline
                      items={auditLogs.map((log: AuditLog) => ({
                        key: log.id,
                        children: (
                          <div>
                            <div className="flex items-center gap-2">
                              <Tag color={log.result === 'SUCCESS' ? 'green' : 'red'}>{log.action}</Tag>
                              <span className="text-sm">{log.targetResource}</span>
                            </div>
                            <div className="mt-1 text-xs text-text-secondary">
                              {formatDateTime(log.createdAt)} · IP: {log.ipAddress}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
