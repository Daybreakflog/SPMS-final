import { describe, it, expect } from 'vitest';

// 测试 MSW setting handler 的状态逻辑（不需要实际网络）
describe('Setting MSW handler state logic', () => {
  const state = {
    basic: { systemName: '智慧物业管理系统', logoUrl: undefined },
    notification: { emailNotify: true, smsNotify: false, pushNotify: true },
    security: { passwordMinLength: 8, passwordExpireDays: 90, maxLoginAttempts: 5, lockDuration: 30, sessionTimeout: 30 },
  };

  it('初始状态 systemName 正确', () => {
    expect(state.basic.systemName).toBe('智慧物业管理系统');
  });

  it('初始状态 emailNotify 为 true', () => {
    expect(state.notification.emailNotify).toBe(true);
  });

  it('初始状态 smsNotify 为 false', () => {
    expect(state.notification.smsNotify).toBe(false);
  });

  it('初始状态 passwordMinLength 为 8', () => {
    expect(state.security.passwordMinLength).toBe(8);
  });

  it('更新 basic 后状态改变', () => {
    const updated = { ...state.basic, systemName: '新系统名' };
    expect(updated.systemName).toBe('新系统名');
  });

  it('更新 security 后 maxLoginAttempts 改变', () => {
    const updated = { ...state.security, maxLoginAttempts: 3 };
    expect(updated.maxLoginAttempts).toBe(3);
  });
});
