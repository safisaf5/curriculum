import { Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import type { Lang } from './data/types';
import { LangProvider } from './i18n';
import { lazyWithPreload } from './lib/lazy';
import { parsePath } from './site';
import { ThemeProvider } from './theme/ThemeProvider';
import { SiteLayout } from './components/layout/SiteLayout';
import { useDocumentHead } from './seo/useDocumentHead';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import NotFoundPage from './pages/NotFoundPage';

// Route-level code splitting for pages that are rarely the entry point
const CvPage = lazyWithPreload(() => import('./pages/CvPage'));
const CardPage = lazyWithPreload(() => import('./pages/CardPage'));
const NotesPage = lazyWithPreload(() => import('./pages/NotesPage'));
const NotePage = lazyWithPreload(() => import('./pages/NotePage'));

/** Load the code for a URL before rendering it (used before hydration and by the prerender). */
export const preloadRoute = async (pathname: string) => {
  const { path } = parsePath(pathname);
  if (path === '/cv') await CvPage.preload();
  else if (path === '/card') await CardPage.preload();
  else if (path === '/notes') await NotesPage.preload();
  else if (path.startsWith('/notes/')) await NotePage.preload();
};

export const preloadAll = () => Promise.all([CvPage.preload(), CardPage.preload(), NotesPage.preload(), NotePage.preload()]);

const LangRoot = ({ lang }: { lang: Lang }) => {
  useDocumentHead();
  return (
    <LangProvider lang={lang}>
      <Suspense fallback={<div className="min-h-screen bg-bg" aria-busy="true" />}>
        <Outlet />
      </Suspense>
    </LangProvider>
  );
};

const pageRoutes = (
  <>
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="projects/:slug" element={<ProjectPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="notes/:slug" element={<NotePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="cv" element={<CvPage />} />
    <Route path="card" element={<CardPage />} />
  </>
);

/** Routes shared by the browser (BrowserRouter) and the prerender (StaticRouter). */
export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/en" element={<LangRoot lang="en" />}>
          {pageRoutes}
        </Route>
        <Route path="/" element={<LangRoot lang="fr" />}>
          {pageRoutes}
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
