import { Button, Popover, ColorPicker, Divider, Space, Tooltip } from 'antd';
import { BgColorsOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/theme.store';
import { THEME_PRESETS } from '@/constants/themePresets';

/** 主题定制：自定义主色调 + 预设方案，配置持久化到 localStorage */
export default function ThemeSettings() {
  const { t } = useTranslation();
  const primaryColor = useThemeStore((s) => s.primaryColor);
  const setPrimaryColor = useThemeStore((s) => s.setPrimaryColor);
  const resetPrimaryColor = useThemeStore((s) => s.resetPrimaryColor);

  const content = (
    <div style={{ width: 240 }}>
      <div className="mb-2 text-sm font-medium">{t('theme.presets')}</div>
      <Space wrap>
        {THEME_PRESETS.map((preset) => {
          const active = preset.color.toLowerCase() === primaryColor.toLowerCase();
          return (
            <Tooltip key={preset.key} title={t(preset.labelKey)}>
              <button
                type="button"
                aria-label={t(preset.labelKey)}
                onClick={() => setPrimaryColor(preset.color)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: preset.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {active && <CheckOutlined style={{ color: '#fff', fontSize: 14 }} />}
              </button>
            </Tooltip>
          );
        })}
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <div className="mb-2 text-sm font-medium">{t('theme.custom')}</div>
      <div className="flex items-center justify-between">
        <ColorPicker
          value={primaryColor}
          onChangeComplete={(color) => setPrimaryColor(color.toHexString())}
          showText
        />
        <Button size="small" type="link" onClick={resetPrimaryColor}>
          {t('theme.reset')}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} title={t('theme.title')} trigger="click" placement="bottomRight">
      <Button type="text" icon={<BgColorsOutlined />} aria-label={t('theme.title')} />
    </Popover>
  );
}
