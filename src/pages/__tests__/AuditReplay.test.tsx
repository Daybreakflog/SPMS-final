import { describe, it, expect } from 'vitest';
import i18n from '@/locales/i18n';
import { AuditModuleLabelKeys, AuditActionLabelKeys, AuditResultMeta, getStatusLabel } from '@/constants/status';
import { AuditModule, AuditAction, AuditResult } from '@/types/enums';

describe('Audit status i18n', () => {
  it('translates all audit module labels', () => {
    Object.entries(AuditModuleLabelKeys).forEach(([, key]) => {
      const label = i18n.t(key);
      expect(label).toBeTruthy();
      expect(label).not.toBe(key);
    });
  });

  it('translates all audit action labels', () => {
    Object.entries(AuditActionLabelKeys).forEach(([, key]) => {
      const label = i18n.t(key);
      expect(label).toBeTruthy();
      expect(label).not.toBe(key);
    });
  });

  it('translates all audit result labels', () => {
    Object.entries(AuditResultMeta).forEach(([, meta]) => {
      const label = i18n.t(meta.labelKey);
      expect(label).toBeTruthy();
      expect(label).not.toBe(meta.labelKey);
    });
  });

  it('getStatusLabel returns translated text', () => {
    const label = getStatusLabel('status.auditModule.user');
    expect(label).toBe('用户');
  });

  it('has correct module translations', () => {
    expect(i18n.t(AuditModuleLabelKeys[AuditModule.USER])).toBe('用户');
    expect(i18n.t(AuditModuleLabelKeys[AuditModule.CONTRACT])).toBe('合同');
    expect(i18n.t(AuditModuleLabelKeys[AuditModule.BILLING])).toBe('账单');
  });

  it('has correct action translations', () => {
    expect(i18n.t(AuditActionLabelKeys[AuditAction.CREATE])).toBe('创建');
    expect(i18n.t(AuditActionLabelKeys[AuditAction.UPDATE])).toBe('更新');
    expect(i18n.t(AuditActionLabelKeys[AuditAction.DELETE])).toBe('删除');
  });

  it('has correct result translations', () => {
    expect(i18n.t(AuditResultMeta[AuditResult.SUCCESS].labelKey)).toBe('成功');
    expect(i18n.t(AuditResultMeta[AuditResult.FAILURE].labelKey)).toBe('失败');
  });

  it('has colors for result meta', () => {
    expect(AuditResultMeta[AuditResult.SUCCESS].color).toBe('green');
    expect(AuditResultMeta[AuditResult.FAILURE].color).toBe('red');
  });
});
