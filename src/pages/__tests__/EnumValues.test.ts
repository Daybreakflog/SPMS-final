import { describe, it, expect } from 'vitest';
import {
  RoleCode, ContractStatus, BillStatus, RepairStatus,
  LeaseStatus, PaymentChannel,
  Gender, IdType, Urgency,
} from '@/types/enums';

describe('RoleCode enum', () => {
  it('PLATFORM_ADMIN 值正确', () => {
    expect(RoleCode.PLATFORM_ADMIN).toBe('PLATFORM_ADMIN');
  });

  it('COMPANY_ADMIN 值正确', () => {
    expect(RoleCode.COMPANY_ADMIN).toBe('COMPANY_ADMIN');
  });

  it('TENANT 值正确', () => {
    expect(RoleCode.TENANT).toBe('TENANT');
  });
});

describe('ContractStatus enum', () => {
  it('DRAFT 值正确', () => {
    expect(ContractStatus.DRAFT).toBe('DRAFT');
  });

  it('ACTIVE 值正确', () => {
    expect(ContractStatus.ACTIVE).toBe('ACTIVE');
  });

  it('TERMINATED 值正确', () => {
    expect(ContractStatus.TERMINATED).toBe('TERMINATED');
  });
});

describe('BillStatus enum', () => {
  it('UNPAID 值正确', () => {
    expect(BillStatus.UNPAID).toBe('UNPAID');
  });

  it('PAID 值正确', () => {
    expect(BillStatus.PAID).toBe('PAID');
  });

  it('OVERDUE 值正确', () => {
    expect(BillStatus.OVERDUE).toBe('OVERDUE');
  });
});

describe('RepairStatus enum', () => {
  it('SUBMITTED 值正确', () => {
    expect(RepairStatus.SUBMITTED).toBe('SUBMITTED');
  });

  it('RATED 值正确', () => {
    expect(RepairStatus.RATED).toBe('RATED');
  });
});

describe('LeaseStatus enum', () => {
  it('ACTIVE 值正确', () => {
    expect(LeaseStatus.ACTIVE).toBe('ACTIVE');
  });

  it('CHECKED_OUT 值正确', () => {
    expect(LeaseStatus.CHECKED_OUT).toBe('CHECKED_OUT');
  });
});

describe('Gender & IdType enum', () => {
  it('MALE 值正确', () => {
    expect(Gender.MALE).toBe('MALE');
  });

  it('FEMALE 值正确', () => {
    expect(Gender.FEMALE).toBe('FEMALE');
  });

  it('ID_CARD 值正确', () => {
    expect(IdType.ID_CARD).toBe('ID_CARD');
  });
});

describe('PaymentChannel enum', () => {
  it('ALIPAY 值正确', () => {
    expect(PaymentChannel.ALIPAY).toBe('ALIPAY');
  });

  it('WECHAT 值正确', () => {
    expect(PaymentChannel.WECHAT).toBe('WECHAT');
  });
});

describe('Urgency enum', () => {
  it('LOW 值正确', () => {
    expect(Urgency.LOW).toBe('LOW');
  });

  it('HIGH 值正确', () => {
    expect(Urgency.HIGH).toBe('HIGH');
  });

  it('MEDIUM 值正确', () => {
    expect(Urgency.MEDIUM).toBe('MEDIUM');
  });
});
