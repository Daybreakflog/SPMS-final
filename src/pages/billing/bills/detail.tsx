import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Space, Tag } from 'antd';
import { PrinterOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import PermissionGuard from '@/components/PermissionGuard';
import { billingService } from '@/services/billing.service';
import { formatDateTime } from '@/utils/format';
import { BillStatusMeta, PaymentChannelLabelKeys } from '@/constants/status';
import { RoleCode, BillStatus, PaymentChannel } from '@/types/enums';
import type { PaymentRecord } from '@/types';
import { getMessageApi } from '@/utils/antd';
import { printElementById } from '@/utils/print';
import { STALE_TIME } from '@/constants/queryConfig';

export default function BillDetailPage () {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: bill, isLoading, refetch } = useQuery({
    queryKey: ['bill-detail', id],
    queryFn: () => billingService.billDetail(id!),
    enabled: !!id,
    staleTime: STALE_TIME.DETAIL,
  });

  const handlePublish = async () => {
    if (!bill) return;
    await billingService.billPublish([bill.id]);
    getMessageApi()?.success(t('billing.publishSuccess'));
    refetch();
  };

  const paymentColumns: TableColumnsType<PaymentRecord> = [
    { title: t('billing.orderNo'), dataIndex: 'orderNo', width: 180 },
    {
      title: t('billing.paymentAmount'),
      dataIndex: 'amount',
      width: 120,
      render: (v: number) => <MoneyDisplay value={v} />,
    },
    {
      title: t('billing.paymentChannel'),
      dataIndex: 'channel',
      width: 100,
      render: (v: PaymentChannel) => PaymentChannelLabelKeys[v] ? t(PaymentChannelLabelKeys[v]) : v,
    },
    { title: t('billing.paidAt'), dataIndex: 'paidAt', width: 180, render: (v: string) => formatDateTime(v) },
  ];

  if (isLoading || !bill) {
    return <Card loading={isLoading} />;
  }

  return (
    <div>
      <PageHeader
        title={`${t('billing.billDetail')} - ${bill.billNo}`}
        showBack
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={() => printElementById('bill-print-area', bill.billNo)}>
              {t('common.print')}
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={() => printElementById('bill-print-area', bill.billNo)}>
              {t('common.exportPdf')}
            </Button>
            <PermissionGuard roles={[RoleCode.FINANCE, RoleCode.PLATFORM_ADMIN]}>
              {!bill.published && (
                <Button type="primary" onClick={handlePublish}>
                  {t('billing.publish')}
                </Button>
              )}
            </PermissionGuard>
          </Space>
        }
      />

      <div id="bill-print-area">
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <Space size="large">
            <span className="text-lg font-medium">{bill.billNo}</span>
            <StatusTag status={bill.status as BillStatus} statusMap={BillStatusMeta} />
            {bill.published ? <Tag color="blue">{t('billing.published')}</Tag> : <Tag>{t('billing.unpublished')}</Tag>}
          </Space>
          <Space size="large">
            <div className="text-center">
              <div className="text-text-tertiary text-xs">{t('billing.amount')}</div>
              <div className="text-lg font-semibold"><MoneyDisplay value={bill.amount} /></div>
            </div>
            <div className="text-center">
              <div className="text-text-tertiary text-xs">{t('billing.paidAmount')}</div>
              <div className="text-lg font-semibold text-green-600"><MoneyDisplay value={bill.paidAmount} /></div>
            </div>
            <div className="text-center">
              <div className="text-text-tertiary text-xs">{t('billing.balance')}</div>
              <div className="text-lg font-semibold text-red-500"><MoneyDisplay value={bill.balance} /></div>
            </div>
          </Space>
        </div>
        <Descriptions column={3} bordered size="small">
          <Descriptions.Item label={t('billing.renter')}>{bill.renterName}</Descriptions.Item>
          <Descriptions.Item label={t('billing.unit')}>{bill.unitNumber}</Descriptions.Item>
          <Descriptions.Item label={t('billing.feeItem')}>{bill.feeItemName}</Descriptions.Item>
          <Descriptions.Item label={t('billing.period')}>{bill.period}</Descriptions.Item>
          <Descriptions.Item label={t('billing.dueDate')}>{bill.dueDate}</Descriptions.Item>
          <Descriptions.Item label={t('common.remark')}>{bill.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('billing.paymentRecords')}>
        <Table<PaymentRecord>
          columns={paymentColumns}
          dataSource={bill.paymentRecords || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: t('billing.noPaymentRecords') }}
        />
      </Card>
      </div>
    </div>
  );
}
