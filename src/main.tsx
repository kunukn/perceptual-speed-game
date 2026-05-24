import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './i18n';
import './i18n/syncHtmlLangDir';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.VITE_DEBUG_LOG === '1') {
  const { initLogger } = await import('@/utils/logger');
  initLogger();
}

if (
  import.meta.env.VITE_RAINBOW_DEBUG == '1' ||
  location.href.includes('debug_rainbow=1')
) {
  import('@/debug/debugRainbow').then(({ initDebugRainbow }) =>
    initDebugRainbow(),
  );
}
