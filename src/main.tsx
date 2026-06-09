import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initWebVitals } from './utils/performance';
import { initGlobalErrorHandlers } from './utils/errorReporter';
import './locales/i18n';
import './styles/global.css';

async function bootstrap() {
  initGlobalErrorHandlers();

  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'warn' });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  initWebVitals();
}

bootstrap();
