import { useState } from 'react';
import { Modal, Descriptions, Tabs, Tag, Spin, Table, Button, Select, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import type { TableColumnsType } from 'antd';
import { projectService } from '@/services/project.service';
import { userService, normalizeRoles } from '@/services/user.service';
import { formatDateTime } from '@/utils/format';
import { RoleLabels } from '@/constants/roles';
import { RoleCode } from '@/types/enums';
import type { ProjectUser } from '@/types';
import PermissionGuard from '@/components/PermissionGuard';
import { getMessageApi } from '@/utils/antd';

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function ProjectDetailModal({ open, id, onClose }: Props) {
  const [selectedOverride, setSelectedOverride] = useState<string[] | undefined>(undefined);
  const [assigning, setAssigning] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: async () => {
      const [project, projectUsers, userResult] = await Promise.all([
        projectService.detail(id),
        projectService.getUsers(id),
        userService.list({ page: 1, pageSize: 200 }),
      ]);
      return { project, projectUsers, allUsers: userResult.items };
    },
    enabled: !!id && open,
  });

  const project = data?.project ?? null;
  const projectUsers = data?.projectUsers ?? [];
  const allUsers = data?.allUsers ?? [];
  const selectedUserIds = selectedOverride ?? projectUsers.map((u) => u.id);

  const handleAssignUsers = async () => {
    if (!id) return;
    setAssigning(true);
    try {
      await projectService.assignUsers(id, { userIds: selectedUserIds });
      getMessageApi()?.success('分配成功');
      setSelectedOverride(undefined);
      await refetch();
    } finally {
      setAssigning(false);
    }
  };

  const userColumns: TableColumnsType<ProjectUser> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', width: 100 },
    { title: '电话', dataIndex: 'phone', width: 130 },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (rawRoles: unknown[]) => (
        <Space size={4} wrap>
          {normalizeRoles(rawRoles).map((r) => (
            <Tag key={r}>{RoleLabels[r as RoleCode] ?? r}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={project ? `${project.name} - 项目详情` : '项目详情'}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !project ? (
        <div className="py-8 text-center text-text-tertiary">项目不存在</div>
      ) : (
        <Tabs
          items={[
            {
              key: 'info',
              label: '基础信息',
              children: (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
                  <Descriptions.Item label="所属公司">{project.companyName}</Descriptions.Item>
                  <Descriptions.Item label="地址">{project.address}</Descriptions.Item>
                  <Descriptions.Item label="负责人">{project.manager || '-'}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{project.contactPhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="面积单位">{project.areaUnit || '-'}</Descriptions.Item>
                  <Descriptions.Item label="楼栋数">{project.buildingCount}</Descriptions.Item>
                  <Descriptions.Item label="单元总数">{project.unitCount}</Descriptions.Item>
                  <Descriptions.Item label="入住率">{project.occupancyRate != null ? `${project.occupancyRate}%` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={project.status === 'ACTIVE' ? 'green' : 'default'}>
                      {project.status === 'ACTIVE' ? '启用' : '禁用'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">{formatDateTime(project.createdAt)}</Descriptions.Item>
                  <Descriptions.Item label="备注">{project.remark || '-'}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'users',
              label: '授权员工',
              children: (
                <div>
                  <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN]}>
                    <div className="mb-4 flex items-center gap-3">
                      <Select
                        mode="multiple"
                        placeholder="选择员工"
                        value={selectedUserIds}
                        onChange={(val) => setSelectedOverride(val)}
                        style={{ minWidth: 300 }}
                        options={allUsers.map((u) => ({ value: u.id, label: `${u.realName} (${u.username})` }))}
                        filterOption={(input, option) =>
                          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      />
                      <Button type="primary" loading={assigning} onClick={handleAssignUsers}>
                        保存分配
                      </Button>
                    </div>
                  </PermissionGuard>
                  <Table
                    columns={userColumns}
                    dataSource={projectUsers}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </div>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
