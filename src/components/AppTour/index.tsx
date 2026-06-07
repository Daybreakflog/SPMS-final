import { useEffect, useRef } from 'react';
import { Tour } from 'antd';
import type { TourProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface AppTourProps {
  open: boolean;
  onFinish: () => void;
}

export default function AppTour({ open, onFinish }: AppTourProps) {
  const { t } = useTranslation();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const bellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    sidebarRef.current = document.querySelector('[role="navigation"]');
    bellRef.current = document.querySelector('[aria-label="Notifications"]');
  }, [open]);

  const steps: TourProps['steps'] = [
    {
      title: t('tour.welcomeTitle'),
      description: t('tour.welcomeDesc'),
      target: null,
    },
    {
      title: t('tour.sidebarTitle'),
      description: t('tour.sidebarDesc'),
      target: () => sidebarRef.current!,
      placement: 'right',
    },
    {
      title: t('tour.searchTitle'),
      description: t('tour.searchDesc'),
      target: null,
    },
    {
      title: t('tour.notificationTitle'),
      description: t('tour.notificationDesc'),
      target: () => bellRef.current!,
      placement: 'bottom',
    },
  ];

  return (
    <Tour
      open={open}
      onClose={onFinish}
      onFinish={onFinish}
      steps={steps}
    />
  );
}
