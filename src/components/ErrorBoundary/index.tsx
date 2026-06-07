import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';
import i18n from '@/locales/i18n';
import { reportError } from '@/utils/errorReporter';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, 'react', errorInfo.componentStack ?? undefined);
  }

  render() {
    if (this.state.hasError) {
      const t = (key: string) => i18n.t(key);
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Result
            status="500"
            title={t('error.title')}
            subTitle={t('error.subtitle')}
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => window.location.reload()}
              >
                {t('error.retry')}
              </Button>,
              <Button
                key="home"
                onClick={() => { window.location.href = '/dashboard'; }}
              >
                {t('error.backHome')}
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
