import { Modal, Descriptions, Tabs, Tag, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/DataTable';
import { companyService } from '@/services/company.service';
import { projectService } from '@/services/project.service';
import { userService, normalizeRoles } from '@/services/user.service';
import { formatDateTime } from '@/utils/format';
import { RoleLabels } from '@/constants/roles';
import { RoleCode } from '@/types/enums';
import type { Project } from '@/types';
import type { StaffUser } from '@/types';
import type { TableColumnsType } from 'antd';

const projectColumns: TableColumnsType<Project> = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '项目编号', dataIndex: 'id', key: 'id', width: 140 },
  {
    title: '状态', dataIndex: 'status', key: 'status', width: 90,
    render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v === 'ACTIVE' ? '启用' : '禁用'}</Tag>,
  },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: formatDateTime },
];

const staffColumns: TableColumnsType<StaffUser> = [
  { title: '姓名', dataIndex: 'realName', key: 'realName' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  {
    title: '角色', dataIndex: 'roles', key: 'roles',
    render: (rawRoles: unknown[]) => normalizeRoles(rawRoles).map((r) => (
      <Tag key={r}>{RoleLabels[r as RoleCode] ?? r}</Tag>
    )),
  },
  { title: '手机', dataIndex: 'phone', key: 'phone', width: 130 },
  {
    title: '状态', dataIndex: 'status', key: 'status', width: 90,
    render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'default'}>{v === 'ACTIVE' ? '启用' : '禁用'}</Tag>,
  },
];

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export default function CompanyDetailModal({ open, id, onClose }: Props) {
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-detail', id],
    queryFn: () => companyService.detail(id),
    enabled: !!id && open,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['company-projects', id],
    queryFn: () => projectService.list({ companyId: id, page: 1, pageSize: 50 }),
    enabled: !!id && open,
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['company-staff', id],
    queryFn: () => userService.list({ companyId: id }),
    enabled: !!id && open,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={company ? `${company.name} - 公司详情` : '公司详情'}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center"><Spin /></div>
      ) : !company ? (
        <div className="py-8 text-center text-text-tertiary">公司不存在</div>
      ) : (
        <Tabs
          items={[
            {
              key: 'info',
              label: '基础信息',
              children: (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="公司名称">{company.name}</Descriptions.Item>
                  <Descriptions.Item label="公司编号">{company.code || '-'}</Descriptions.Item>
                  <Descriptions.Item label="联系人">{company.contact}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{company.phone}</Descriptions.Item>
                  <Descriptions.Item label="地址">{company.address || '-'}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={company.status === 'ACTIVE' ? 'green' : 'default'}>
                      {company.status === 'ACTIVE' ? '启用' : '禁用'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="项目数">{company.projectCount}</Descriptions.Item>
                  <Descriptions.Item label="员工数">{company.staffCount}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{formatDateTime(company.createdAt)}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'projects',
              label: '项目列表',
              children: (
                <DataTable<Project>
                  columns={projectColumns}
                  dataSource={projects?.items ?? []}
                  loading={projectsLoading}
                  total={projects?.total ?? 0}
                  rowKey="id"
                />
              ),
            },
            {
              key: 'staff',
              label: '员工列表',
              children: (
                <DataTable<StaffUser>
                  columns={staffColumns}
                  dataSource={staff?.items ?? []}
                  loading={staffLoading}
                  total={staff?.total ?? 0}
                  rowKey="id"
                />
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}
