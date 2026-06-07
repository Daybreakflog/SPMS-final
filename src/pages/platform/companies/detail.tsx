import { useParams } from 'react-router-dom';
import { Descriptions, Tabs, Tag, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import { companyService } from '@/services/company.service';
import { formatDateTime } from '@/utils/format';
export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-detail', id],
    queryFn: () => companyService.detail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spin /></div>;
  }

  if (!company) {
    return <div className="text-center text-text-tertiary">公司不存在</div>;
  }

  return (
    <div>
      <PageHeader title={company.name} subtitle="物业公司详情" showBack />
      <Tabs
        items={[
          {
            key: 'info',
            label: '基础信息',
            children: (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="公司名称">{company.name}</Descriptions.Item>
                <Descriptions.Item label="社会信用代码">{company.creditCode || '-'}</Descriptions.Item>
                <Descriptions.Item label="联系人">{company.contactPerson}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{company.contactPhone}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{company.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="地址">{company.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={company.status === 'ACTIVE' ? 'green' : 'default'}>
                    {company.status === 'ACTIVE' ? '启用' : '禁用'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="项目数">{company.projectCount}</Descriptions.Item>
                <Descriptions.Item label="员工数">{company.staffCount}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{formatDateTime(company.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>{company.remark || '-'}</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'projects',
            label: '项目列表',
            children: <div className="py-8 text-center text-text-tertiary">关联项目列表（基于项目模块数据）</div>,
          },
          {
            key: 'staff',
            label: '员工列表',
            children: <div className="py-8 text-center text-text-tertiary">关联员工列表（基于员工模块数据）</div>,
          },
        ]}
      />
    </div>
  );
}
