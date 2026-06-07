/** 预设主题配色方案（主色调） */
export interface ThemePreset {
  key: string;
  /** 国际化 key */
  labelKey: string;
  color: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { key: 'default', labelKey: 'theme.presetDefault', color: '#1677ff' },
  { key: 'green', labelKey: 'theme.presetGreen', color: '#13c2c2' },
  { key: 'purple', labelKey: 'theme.presetPurple', color: '#722ed1' },
  { key: 'volcano', labelKey: 'theme.presetVolcano', color: '#fa541c' },
  { key: 'gold', labelKey: 'theme.presetGold', color: '#faad14' },
];
