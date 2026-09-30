import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App, { preloadAll } from './App';
import { projects } from './data';
import { getHead, renderHeadTags } from './seo/head';
import { getNoteSlugs } from './lib/notes';
import { LANGS, localizePath } from './site';

export { buildSitemap, buildLlmsTxt } from './seo/files';

/** Every URL to prerender, in both languages. */
export const getRoutes = (): string[] => {
  const paths = ['/', '/cv', '/card', '/notes', ...projects.map((p) => `/projects/${p.slug}`), ...getNoteSlugs().map((s) => `/notes/${s}`)];
  return LANGS.flatMap((lang) => paths.map((p) => localizePath(p, lang)));
};

export const render = async (url: string) => {
  await preloadAll();
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const head = getHead(url);
  return { html, head: renderHeadTags(head), lang: head.lang, status: head.status };
};
