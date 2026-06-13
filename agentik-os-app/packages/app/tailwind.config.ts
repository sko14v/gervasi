import type { Config } from 'tailwindcss';

/**
 * Tailwind 3.4 (NO Tailwind 4 — más estable, menos breaking changes).
 * El sistema de diseño visual completo se definirá en la tarea
 * f1-frontend-impl; aquí dejamos la base.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
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
    },
  },
  plugins: [],
};

export default config;
