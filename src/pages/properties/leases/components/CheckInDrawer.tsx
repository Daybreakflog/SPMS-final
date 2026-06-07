import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import FormDrawer from '@/components/FormDrawer';
import { leaseService } from '@/services/lease.service';
import { renterService } from '@/services/renter.service';
import { getMessageApi } from '@/utils/antd';
import type { Renter } from '@/types';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInDrawer({ open, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [renters, setRenters] = useState<Renter[]>([]);

  useEffect(() => {
    if (open) {
      renterService.list({ page: 1, pageSize: 200 }).then((res) => setRenters(res.items));
    }
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      await leaseService.checkIn({
        renterId: values.renterId as string,
        unitId: values.unitId as string,
        checkInDate: (values.checkInDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        contractId: values.contractId as string | undefined,
        coResidents: (values.coResidents as Array<{ name: string; phone?: string; relation?: string }>) ?? [],
        remark: values.remark as string | undefined,
      });
      getMessageApi()?.success('入住办理成功');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      title="办理入住"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      width={640}
      initialValues={{}}
    >
      <Form.Item name="renterId" label="租户" rules={[{ required: true, message: '请选择租户' }]}>
        <Select
          showSearch
          placeholder="搜索选择租户"
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
          options={renters.map((r) => ({
            value: r.id,
            label: `${r.name} - ${r.phone}`,
          }))}
        />
      </Form.Item>
      <Form.Item name="unitId" label="单元" rules={[{ required: true, message: '请输入单元ID' }]}>
        <Input placeholder="请输入单元ID" />
      </Form.Item>
      <Form.Item name="checkInDate" label="入住日期" rules={[{ required: true, message: '请选择入住日期' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="contractId" label="关联合同">
        <Input placeholder="可输入合同ID（选填）" />
      </Form.Item>

      <div className="mb-2 mt-4 text-sm font-medium text-text-secondary">随住人员</div>
      <Form.List name="coResidents">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} className="mb-2 flex gap-2">
                <Form.Item {...restField} name={[name, 'name']} className="mb-0 flex-1" rules={[{ required: true, message: '姓名' }]}>
                  <Input placeholder="姓名" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'phone']} className="mb-0 flex-1">
                  <Input placeholder="手机号" />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'relation']} className="mb-0 w-24">
                  <Input placeholder="关系" />
                </Form.Item>
                <MinusCircleOutlined className="mt-2 text-red-500" onClick={() => remove(name)} />
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加随住人员
            </Button>
          </>
        )}
      </Form.List>

      <Form.Item name="remark" label="备注" className="mt-4">
        <Input.TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>
    </FormDrawer>
  );
}
