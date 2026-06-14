import type { Config } from 'tailwindcss';

/**
 * Tailwind 3.4 — Design System completo (Mission Control / Apple HIG).
 *
 * Tokens mapeados a CSS variables definidas en index.css.
 * Light + dark mode vía data-theme attribute.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        tint: 'var(--bg-tint)',
        'tint-2': 'var(--bg-tint-2)',
        separator: 'var(--separator)',
        'separator-opaque': 'var(--separator-opaque)',
        label: {
          primary: 'var(--label-primary)',
          secondary: 'var(--label-secondary)',
          tertiary: 'var(--label-tertiary)',
          quaternary: 'var(--label-quaternary)',
          inverse: 'var(--label-inverse)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        premium: 'var(--premium)',
        charter: 'var(--color-charter)',
        sdr: 'var(--color-sdr)',
        // Legacy primary colors (keep for backward compat during migration)
        primary: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec1ff',
          400: '#599dff',
          500: '#3478ff',
          600: '#2058f5',
          700: '#1a45e0',
          800: '#1c3bb6',
          900: '#1c3790',
          950: '#152357',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl': ['56px', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['44px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '600' }],
        'title-1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title-2': ['22px', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline': ['17px', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
        'caption-2': ['11px', { lineHeight: '1.3', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      spacing: {
        'space-0': '0',
        'space-1': '2px',
        'space-2': '4px',
        'space-3': '8px',
        'space-4': '12px',
        'space-5': '16px',
        'space-6': '20px',
        'space-7': '24px',
        'space-8': '32px',
        'space-9': '40px',
        'space-10': '48px',
        'space-11': '64px',
        'space-12': '96px',
      },
      borderRadius: {
        'radius-xs': '4px',
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '20px',
        'radius-2xl': '28px',
        'radius-3xl': '36px',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      backdropBlur: {
        'glass': '24px',
        'tabbar': '40px',
        'sheet': '50px',
      },
      boxShadow: {
        'liquid': '0 12px 40px -8px rgba(0, 0, 0, 0.18), 0 2px 6px -2px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
        'popover': '0 10px 30px -10px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'glass-inset': '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 -1px 0 rgba(0, 0, 0, 0.04) inset',
      },
    },
  },
  plugins: [],
};

export default config;
