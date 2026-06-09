import { Card, Tag, List, Empty, Spin, Badge, Avatar, Divider } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  WalletOutlined,
  ToolOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { contractService } from '@/services/contract.service';
import { billingService } from '@/services/billing.service';
import { repairService } from '@/services/repair.service';
import { formatDateTime } from '@/utils/format';
import type { Renter } from '@/types';

interface Props {
  renter: Renter;
}

export default function TenantAppPreview({ renter }: Props) {
  const { t } = useTranslation();

  const { data: contractsData, isLoading: contractLoading } = useQuery({
    queryKey: ['tenant-contracts', renter.id],
    queryFn: () => contractService.list({ renterProfileId: renter.id, pageSize: 3, page: 1 }),
  });

  const { data: billsData, isLoading: billLoading } = useQuery({
    queryKey: ['tenant-bills', renter.id],
    queryFn: () => billingService.billList({ renterProfileId: renter.id, pageSize: 3, page: 1, status: 'UNPAID' }),
  });

  const { data: repairsData, isLoading: repairLoading } = useQuery({
    queryKey: ['tenant-repairs', renter.id],
    queryFn: () => repairService.list({ renterId: renter.id, pageSize: 3, page: 1 } as Parameters<typeof repairService.list>[0]),
  });

  const contracts = contractsData?.items ?? [];
  const bills = billsData?.items ?? [];
  const repairs = repairsData?.items ?? [];
  const isLoading = contractLoading || billLoading || repairLoading;

  const contractStatusColor: Record<string, string> = {
    ACTIVE: 'green', DRAFT: 'default', PENDING_FINANCE: 'blue',
    PENDING_ADMIN: 'orange', TERMINATED: 'red', EXPIRED: 'volcano',
  };
  const billStatusColor: Record<string, string> = {
    UNPAID: 'red', PARTIAL: 'orange', PAID: 'green', OVERDUE: 'volcano',
  };
  const repairStatusColor: Record<string, string> = {
    SUBMITTED: 'blue', ASSIGNED: 'orange', IN_PROGRESS: 'processing',
    COMPLETED: 'green', RATED: 'default',
  };

  return (
    <div className="flex justify-center py-4">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl"
        style={{ width: 320, minHeight: 620, background: '#f5f5f5' }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between bg-[#1677ff] px-4 py-2">
          <span className="text-xs text-white">9:41</span>
          <span className="text-xs font-semibold text-white">{t('tenantApp.title')}</span>
          <span className="text-xs text-white">📶</span>
        </div>

        {/* App header */}
        <div className="bg-[#1677ff] px-4 pb-5 pt-2">
          <div className="flex items-center gap-3">
            <Avatar size={44} icon={<UserOutlined />} className="bg-white/20" />
            <div>
              <p className="font-semibold text-white">{renter.name}</p>
              <p className="text-xs text-blue-100">
                {renter.company?.name ?? t('tenantApp.noUnit')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[520px] overflow-y-auto bg-gray-50 p-3">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center"><Spin /></div>
          ) : (
            <div className="space-y-3">
              {/* Quick actions */}
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-white p-3 shadow-sm">
                {[
                  { icon: <HomeOutlined />, label: t('tenantApp.myUnit'), color: '#1677ff' },
                  { icon: <FileTextOutlined />, label: t('tenantApp.myContract'), color: '#52c41a' },
                  { icon: <WalletOutlined />, label: t('tenantApp.myBill'), color: '#faad14' },
                  { icon: <ToolOutlined />, label: t('tenantApp.myRepair'), color: '#ff4d4f' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{ background: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-center text-[10px] text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Contracts */}
              <Card
                size="small"
                title={<span className="text-xs font-medium">{t('tenantApp.myContract')}</span>}
                extra={<Badge count={contracts.length} size="small" />}
                className="shadow-sm"
              >
                {contracts.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('tenantApp.noContract')} className="py-2 text-xs" />
                ) : (
                  <List
                    dataSource={contracts}
                    renderItem={(c) => (
                      <List.Item className="px-0 py-1.5">
                        <div className="flex w-full items-center justify-between">
                          <div>
                            <p className="text-xs font-medium">{c.contractNo}</p>
                            <p className="text-[10px] text-gray-400">{c.startDate} ~ {c.endDate}</p>
                          </div>
                          <Tag color={contractStatusColor[c.status] ?? 'default'} className="text-[10px]">
                            {t(`status.contract.${c.status.toLowerCase().replace(/_/g, '.')}`, { defaultValue: c.status })}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* Bills */}
              <Card
                size="small"
                title={<span className="text-xs font-medium">{t('tenantApp.pendingBills')}</span>}
                extra={<Badge count={bills.length} color="red" size="small" />}
                className="shadow-sm"
              >
                {bills.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('tenantApp.noBill')} className="py-2 text-xs" />
                ) : (
                  <List
                    dataSource={bills}
                    renderItem={(b) => (
                      <List.Item className="px-0 py-1.5">
                        <div className="flex w-full items-center justify-between">
                          <div>
                            <p className="text-xs font-medium">{b.feeItemName}</p>
                            <p className="text-[10px] text-gray-400">{b.period}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-red-500">¥{b.amount}</p>
                            <Tag color={billStatusColor[b.status] ?? 'default'} className="mt-0.5 text-[10px]">
                              {t(`status.bill.${b.status.toLowerCase()}`, { defaultValue: b.status })}
                            </Tag>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* Repairs */}
              <Card
                size="small"
                title={<span className="text-xs font-medium">{t('tenantApp.myRepair')}</span>}
                className="shadow-sm"
              >
                {repairs.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('tenantApp.noRepair')} className="py-2 text-xs" />
                ) : (
                  <List
                    dataSource={repairs}
                    renderItem={(r) => (
                      <List.Item className="px-0 py-1.5">
                        <div className="flex w-full items-center justify-between">
                          <div>
                            <p className="text-xs font-medium">{r.description?.slice(0, 24) ?? r.orderNo}</p>
                            <p className="text-[10px] text-gray-400">{formatDateTime(r.createdAt)}</p>
                          </div>
                          <Tag color={repairStatusColor[r.status] ?? 'default'} className="text-[10px]">
                            {t(`status.repair.${r.status.toLowerCase()}`, { defaultValue: r.status })}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* Footer */}
              <Divider className="my-1" />
              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <BellOutlined />
                <span>{t('tenantApp.footerTip')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav bar */}
        <div className="flex border-t border-gray-200 bg-white">
          {[
            { icon: <HomeOutlined />, label: t('tenantApp.home') },
            { icon: <WalletOutlined />, label: t('tenantApp.pay') },
            { icon: <ToolOutlined />, label: t('tenantApp.service') },
            { icon: <UserOutlined />, label: t('tenantApp.mine') },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex flex-1 flex-col items-center py-2 text-[10px] ${idx === 0 ? 'text-[#1677ff]' : 'text-gray-400'}`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description panel */}
      <div className="ml-6 w-60 space-y-3 pt-2">
        <Card size="small" title={t('tenantApp.dataStats')}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('tenantApp.totalContracts')}</span>
              <span className="font-medium">{contractsData?.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('tenantApp.unpaidBills')}</span>
              <span className="font-medium text-red-500">{billsData?.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('tenantApp.activeRepairs')}</span>
              <span className="font-medium text-orange-500">{repairsData?.total ?? 0}</span>
            </div>
          </div>
        </Card>
        <Card size="small" title={t('tenantApp.appInfo')}>
          <p className="text-xs text-gray-500">{t('tenantApp.appInfoDesc')}</p>
        </Card>
      </div>
    </div>
  );
}
