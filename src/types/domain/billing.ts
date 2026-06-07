export interface FeeItem {
  id: string;
  name: string;
  code?: string;
  billingRule: 'FIXED' | 'BY_AREA' | 'BY_METER';
  unitPrice: number;
  unit: string;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  projectId?: string;
  projectName?: string;
  status: 'ACTIVE' | 'DISABLED';
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  orderNo: string;
  amount: number;
  channel: 'WECHAT' | 'ALIPAY' | 'BANK';
  paidAt: string;
}

export interface Bill {
  id: string;
  billNo: string;
  renterId: string;
  renterName: string;
  unitId: string;
  unitNumber: string;
  feeItemId: string;
  feeItemName: string;
  period: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string;
  published: boolean;
  remark?: string;
  paymentRecords?: PaymentRecord[];
  projectId?: string;
  projectName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentOrder {
  id: string;
  orderNo: string;
  renterId: string;
  renterName: string;
  amount: number;
  channel: 'WECHAT' | 'ALIPAY' | 'BANK';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  billCount: number;
  description?: string;
  paidAt?: string;
  createdAt: string;
}
