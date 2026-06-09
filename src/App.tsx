import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import zhCN from 'antd/locale/zh_CN';
import router from '@/router';
import { useThemeStore } from '@/store/theme.store';
import { lightTheme, darkTheme } from '@/styles/antd-theme';
import { setMessageApi } from '@/utils/antd';
import ErrorBoundary from '@/components/ErrorBoundary';
import { STALE_TIME, GC_TIME } from '@/constants/queryConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME.LIST,
      gcTime: GC_TIME.DEFAULT,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppInner() {
  const { message } = AntApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return <RouterProvider router={router} />;
}

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const primaryColor = useThemeStore((s) => s.primaryColor);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const baseTheme = mode === 'dark'
    ? { ...darkTheme, algorithm: theme.darkAlgorithm }
    : lightTheme;
  const themeConfig = {
    ...baseTheme,
    token: { ...baseTheme.token, colorPrimary: primaryColor, colorInfo: primaryColor },
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={themeConfig} locale={zhCN}>
          <AntApp>
            <AppInner />
          </AntApp>
        </ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
