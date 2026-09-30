import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/index.css';
import App, { preloadRoute } from './App';
import { initAnalytics } from './lib/analytics';

const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

const start = async () => {
  const container = document.getElementById('root')!;
  const path = normalize(window.location.pathname);

  // Load the code-split page for this URL first, so hydration never suspends.
  await preloadRoute(path);

  const app = (
    <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </StrictMode>
  );

  // Hydrate only when the static HTML was rendered for this exact URL
  // (404.html is served for unknown paths and is rendered client-side).
  if (container.firstElementChild && container.dataset.path === path) {
    hydrateRoot(container, app);
  } else {
    container.textContent = '';
    createRoot(container).render(app);
  }

  initAnalytics();
};

start();
