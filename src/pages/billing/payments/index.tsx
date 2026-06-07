import { Button, Form, Input, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import PageHeader from '@/components/PageHeader';
import SearchFilterBar from '@/components/SearchFilterBar';
import DataTable from '@/components/DataTable';
import StatusTag from '@/components/StatusTag';
import MoneyDisplay from '@/components/MoneyDisplay';
import { useTableQuery } from '@/hooks/useTableQuery';
import { paymentService } from '@/services/payment.service';
import { PaymentChannelLabelKeys, PaymentOrderStatusMeta } from '@/constants/status';
import { PaymentChannel, PaymentOrderStatus } from '@/types/enums';
import { formatDate } from '@/utils/format';
import type { PaymentOrder, PaymentOrderListParams } from '@/types';
import { getMessageApi } from '@/utils/antd';

const isDev = import.meta.env.DEV;

export default function PaymentOrderListPage() {
  const { t } = useTranslation();

  const { data, total, page, pageSize, loading, onPageChange, onFilterChange, onReset, refetch } =
    useTableQuery<PaymentOrder, PaymentOrderListParams>({
      queryKey: 'paymentOrders',
      queryFn: (params) => paymentService.list(params),
      defaultFilter: {} as PaymentOrderListParams,
    });

  const handleMockSuccess = async (orderNo: string) => {
    await paymentService.mockSuccess(orderNo);
    getMessageApi()?.success(t('billing.mockPaymentSuccess'));
    refetch();
  };

  const columns: TableColumnsType<PaymentOrder> = [
    { title: t('billing.orderNo'), dataIndex: 'orderNo', width: 180 },
    { title: t('billing.renter'), dataIndex: 'renterName', width: 80 },
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
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 100,
      render: (v: PaymentOrderStatus) => <StatusTag status={v} statusMap={PaymentOrderStatusMeta} />,
    },
    { title: t('billing.billCount'), dataIndex: 'billCount', width: 90 },
    {
      title: t('billing.paidAt'),
      dataIndex: 'paidAt',
      width: 160,
      render: (v: string) => v ? formatDate(v) : '-',
    },
    {
      title: t('common.operation'),
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {isDev && record.status === 'PENDING' && (
            <Button type="link" size="small" onClick={() => handleMockSuccess(record.orderNo)}>
              {t('billing.mockPayment')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('billing.paymentTitle')} />

      <SearchFilterBar<PaymentOrderListParams>
        onSearch={onFilterChange}
        onReset={onReset}
        collapsible={false}
      >
        <Form.Item name="keyword" label={t('billing.orderNo')}>
          <Input placeholder={t('billing.orderNoPlaceholder')} allowClear />
        </Form.Item>
        <Form.Item name="channel" label={t('billing.paymentChannel')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 140 }}>
            {Object.entries(PaymentChannelLabelKeys).map(([key, labelKey]) => (
              <Select.Option key={key} value={key}>{t(labelKey)}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label={t('common.status')}>
          <Select allowClear placeholder={t('common.all')} style={{ width: 120 }}>
            <Select.Option value="PENDING">待支付</Select.Option>
            <Select.Option value="SUCCESS">支付成功</Select.Option>
            <Select.Option value="FAILED">支付失败</Select.Option>
          </Select>
        </Form.Item>
      </SearchFilterBar>

      <DataTable<PaymentOrder>
        columns={columns}
        dataSource={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
