import { Button, DatePicker, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface DateQuickPickerProps {
  value?: [Dayjs, Dayjs] | null;
  onChange: (start: string, end: string) => void;
}

export default function DateQuickPicker({ value, onChange }: DateQuickPickerProps) {
  const { t } = useTranslation();

  const handleQuick = (type: string) => {
    let start: Dayjs;
    let end: Dayjs;
    switch (type) {
      case 'thisMonth':
        start = dayjs().startOf('month');
        end = dayjs().endOf('month');
        break;
      case 'lastMonth':
        start = dayjs().subtract(1, 'month').startOf('month');
        end = dayjs().subtract(1, 'month').endOf('month');
        break;
      case 'thisQuarter':
        start = dayjs().startOf('quarter' as dayjs.OpUnitType);
        end = dayjs().endOf('quarter' as dayjs.OpUnitType);
        break;
      case 'thisYear':
        start = dayjs().startOf('year');
        end = dayjs().endOf('year');
        break;
      default:
        return;
    }
    onChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onChange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }
  };

  return (
    <Space wrap>
      <Button size="small" onClick={() => handleQuick('thisMonth')}>{t('report.thisMonth')}</Button>
      <Button size="small" onClick={() => handleQuick('lastMonth')}>{t('report.lastMonth')}</Button>
      <Button size="small" onClick={() => handleQuick('thisQuarter')}>{t('report.thisQuarter')}</Button>
      <Button size="small" onClick={() => handleQuick('thisYear')}>{t('report.thisYear')}</Button>
      <RangePicker
        value={value}
        onChange={handleRangeChange}
        allowClear
        size="small"
      />
    </Space>
  );
}
