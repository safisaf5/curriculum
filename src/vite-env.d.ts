/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_PROVIDER?: 'plausible' | 'umami';
  readonly VITE_ANALYTICS_DOMAIN?: string;
  readonly VITE_ANALYTICS_SITE_ID?: string;
  readonly VITE_ANALYTICS_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
