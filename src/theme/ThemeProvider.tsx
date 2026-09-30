import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Theme state lives in a tiny external store, not in React context: only the
 * components that read it re-render when it changes. (A context update at the
 * root would force every not-yet-hydrated section of the page to re-render.)
 *
 * The initial class is set by /theme-init.js before the first paint.
 */
const THEME_COLORS: Record<Theme, string> = { light: '#F3F1EC', dark: '#0B0B0C' };
const listeners = new Set<() => void>();

const read = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

const apply = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = THEME_COLORS[theme];
  });
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Mount once: follows the system setting while the visitor has not chosen explicitly. */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        /* ignore */
      }
      if (!saved) apply(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return <>{children}</>;
};

/** Current theme (null on the server and during hydration) and a toggle. */
export const useTheme = () => {
  const theme = useSyncExternalStore<Theme | null>(subscribe, read, () => null);
  const toggleTheme = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    // Avoid every element animating its colours during the switch
    root.classList.add('theme-switching');
    apply(next);
    window.setTimeout(() => root.classList.remove('theme-switching'), 50);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
  }, []);
  return { theme, toggleTheme };
};
