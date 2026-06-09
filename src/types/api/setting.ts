export interface SystemSetting {
  basic: {
    systemName: string;
    logoUrl?: string;
  };
  notification: {
    emailNotify: boolean;
    smsNotify: boolean;
    pushNotify: boolean;
  };
  security: {
    passwordMinLength: number;
    passwordExpireDays: number;
    maxLoginAttempts: number;
    lockDuration: number;
    sessionTimeout: number;
  };
}

export type BasicSettingDTO = SystemSetting['basic'];
export type NotificationSettingDTO = SystemSetting['notification'];
export type SecuritySettingDTO = SystemSetting['security'];
