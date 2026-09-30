/**
 * Privacy-first analytics facade.
 *
 * Nothing is tracked by default. To enable, set at build time:
 *   VITE_ANALYTICS_PROVIDER=plausible   VITE_ANALYTICS_DOMAIN=safwan.ch
 *   (or) VITE_ANALYTICS_PROVIDER=umami  VITE_ANALYTICS_SITE_ID=<id>  VITE_ANALYTICS_SRC=<script url>
 * and allow the script host in the Content-Security-Policy (netlify.toml).
 * Both providers are cookie-less. "Do Not Track" and "Global Privacy
 * Control" are always honoured. See docs/ARCHITECTURE.md.
 */

export type AnalyticsEvent =
  | 'cv_view'
  | 'cv_download'
  | 'cv_print'
  | 'vcard_download'
  | 'contact_email'
  | 'contact_phone'
  | 'contact_whatsapp'
  | 'contact_linkedin'
  | 'contact_form_submit'
  | 'contact_form_success'
  | 'contact_form_error'
  | 'project_view'
  | 'project_filter'
  | 'service_cta'
  | 'media_open'
  | 'card_share'
  | 'language_switch'
  | 'theme_switch';

type Props = Record<string, string | number | boolean>;

interface Provider {
  pageview: (path: string) => void;
  event: (name: AnalyticsEvent, props?: Props) => void;
}

const env = (typeof import.meta !== 'undefined' && import.meta.env) || ({} as ImportMetaEnv);
const PROVIDER = env.VITE_ANALYTICS_PROVIDER as string | undefined;

let provider: Provider | null = null;
let queue: Array<() => void> = [];

const optedOut = () => {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
};

const loadScript = (src: string, attrs: Record<string, string>) =>
  new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`analytics script failed: ${src}`));
    document.head.appendChild(s);
  });

type PlausibleFn = (name: string, opts?: { props?: Props; u?: string }) => void;
type UmamiApi = { track: (name?: string | object, data?: Props) => void };

/** Call once on the client. Safe to call when analytics is disabled. */
export const initAnalytics = async () => {
  if (typeof window === 'undefined' || !PROVIDER || optedOut()) return;
  try {
    if (PROVIDER === 'plausible') {
      const domain = env.VITE_ANALYTICS_DOMAIN || 'safwan.ch';
      const src = env.VITE_ANALYTICS_SRC || 'https://plausible.io/js/script.manual.js';
      await loadScript(src, { 'data-domain': domain });
      const p = (window as unknown as { plausible?: PlausibleFn }).plausible;
      if (!p) return;
      provider = {
        pageview: (path) => p('pageview', { u: `${location.origin}${path}` }),
        event: (name, props) => p(name, { props }),
      };
    } else if (PROVIDER === 'umami') {
      const src = env.VITE_ANALYTICS_SRC;
      const id = env.VITE_ANALYTICS_SITE_ID;
      if (!src || !id) return;
      await loadScript(src, { 'data-website-id': id, 'data-auto-track': 'false' });
      const u = (window as unknown as { umami?: UmamiApi }).umami;
      if (!u) return;
      provider = {
        pageview: (path) => u.track({ url: path, title: document.title }),
        event: (name, props) => u.track(name, props),
      };
    }
    queue.forEach((fn) => fn());
  } catch {
    provider = null;
  } finally {
    queue = [];
  }
};

const run = (fn: (p: Provider) => void) => {
  if (!PROVIDER || typeof window === 'undefined') return;
  if (provider) fn(provider);
  else queue.push(() => provider && fn(provider));
};

export const trackPageview = (path: string) => run((p) => p.pageview(path));

export const track = (name: AnalyticsEvent, props?: Props) => {
  if (import.meta.env?.DEV) console.debug('[analytics]', name, props ?? '');
  run((p) => p.event(name, props));
};
