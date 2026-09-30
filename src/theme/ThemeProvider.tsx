import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** null until mounted (the server cannot know the visitor's theme). */
  theme: Theme | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: null, toggleTheme: () => {} });

const THEME_COLORS: Record<Theme, string> = { light: '#F3F1EC', dark: '#0B0B0C' };

const apply = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = THEME_COLORS[theme];
  });
};

/**
 * The initial class is set by /theme-init.js before paint. This provider only
 * reads it after mount, persists changes and follows the system setting
 * while the visitor has not chosen explicitly.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        /* ignore */
      }
      if (saved) return;
      const next: Theme = e.matches ? 'dark' : 'light';
      apply(next);
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const current: Theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next: Theme = current === 'dark' ? 'light' : 'dark';
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
    setTheme(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
