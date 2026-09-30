import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics';
import { getHead } from './head';

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

/**
 * Keeps <head> in sync on client-side navigation. The first page load
 * already has the right tags from the prerender, so this only updates.
 */
export const useDocumentHead = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const h = getHead(pathname);
    document.documentElement.lang = h.lang;
    if (document.title !== h.title) document.title = h.title;
    setMeta('meta[name="description"]', 'name', 'description', h.description);
    setMeta('meta[name="robots"]', 'name', 'robots', h.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', h.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', h.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', h.canonical);
    setMeta('meta[property="og:image"]', 'property', 'og:image', h.ogImage);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = h.canonical;

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
    h.alternates.forEach((a) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = a.hreflang;
      link.href = a.href;
      document.head.appendChild(link);
    });

    trackPageview(pathname);
  }, [pathname]);
};
