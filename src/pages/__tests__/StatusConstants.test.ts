import { describe, it, expect } from 'vitest';
import { ContractStatusMeta, BillStatusMeta, RepairStatusMeta } from '@/constants/status';
import { ContractStatus, BillStatus, RepairStatus } from '@/types/enums';

describe('ContractStatusMeta', () => {
  it('DRAFT 颜色为 default', () => {
    expect(ContractStatusMeta[ContractStatus.DRAFT].color).toBe('default');
  });

  it('ACTIVE 颜色为 green', () => {
    expect(ContractStatusMeta[ContractStatus.ACTIVE].color).toBe('green');
  });

  it('REJECTED 颜色为 red', () => {
    expect(ContractStatusMeta[ContractStatus.REJECTED].color).toBe('red');
  });

  it('包含所有状态键', () => {
    const keys = Object.keys(ContractStatusMeta);
    expect(keys).toContain(ContractStatus.DRAFT);
    expect(keys).toContain(ContractStatus.ACTIVE);
  });
});

describe('BillStatusMeta', () => {
  it('UNPAID 颜色为 default', () => {
    expect(BillStatusMeta[BillStatus.UNPAID].color).toBe('default');
  });

  it('PAID 颜色为 green', () => {
    expect(BillStatusMeta[BillStatus.PAID].color).toBe('green');
  });

  it('OVERDUE 颜色为 red', () => {
    expect(BillStatusMeta[BillStatus.OVERDUE].color).toBe('red');
  });

  it('PARTIAL 颜色为 gold', () => {
    expect(BillStatusMeta[BillStatus.PARTIAL].color).toBe('gold');
  });
});

describe('RepairStatusMeta', () => {
  it('SUBMITTED 颜色为 default', () => {
    expect(RepairStatusMeta[RepairStatus.SUBMITTED].color).toBe('default');
  });

  it('IN_PROGRESS 颜色为 processing', () => {
    expect(RepairStatusMeta[RepairStatus.IN_PROGRESS].color).toBe('processing');
  });

  it('COMPLETED 颜色为 green', () => {
    expect(RepairStatusMeta[RepairStatus.COMPLETED].color).toBe('green');
  });
});
