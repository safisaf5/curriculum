/** @type {import('tailwindcss').Config} */

// Design tokens live as CSS variables in src/styles/index.css (light + dark).
// Tailwind only maps them, so a theme switch never needs a rebuild.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        bg: token('bg'),
        'bg-2': token('bg-2'),
        surface: token('surface'),
        ink: token('ink'),
        'ink-2': token('ink-2'),
        'ink-3': token('ink-3'),
        line: token('line'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
      },
      fontFamily: {
        sans: ['"Archivo Variable"', 'Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid display scale. Values are clamp(min, preferred, max).
        'display-xl': ['clamp(3.1rem, 11.2vw, 12.5rem)', { lineHeight: '0.84', letterSpacing: '-0.035em' }],
        'display-l': ['clamp(2.5rem, 6.4vw, 6.25rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-m': ['clamp(1.9rem, 3.6vw, 3.4rem)', { lineHeight: '1', letterSpacing: '-0.022em' }],
        'display-s': ['clamp(1.4rem, 2.2vw, 2rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        lead: ['clamp(1.125rem, 1.45vw, 1.4rem)', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.08em' }],
      },
      maxWidth: {
        site: '1520px',
        prose: '38rem',
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 11rem)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      keyframes: {
        'rise-in': {
          '0%': { transform: 'translate3d(0, 0.35em, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'draw-line': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translate3d(0, 8px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        loading: {
          '0%': { transform: 'translate3d(-100%, 0, 0)' },
          '100%': { transform: 'translate3d(300%, 0, 0)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'draw-line': 'draw-line 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'page-in': 'page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 40s linear infinite',
        blink: 'blink 2.4s ease-in-out infinite',
        loading: 'loading 1.1s cubic-bezier(0.76, 0, 0.24, 1) infinite',
      },
    },
  },
  plugins: [],
};
