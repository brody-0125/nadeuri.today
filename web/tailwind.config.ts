import type { Config } from 'tailwindcss';

const colorVar = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif KR"', 'serif'],
        sans: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: colorVar('--color-bg'),
          cream: colorVar('--color-bg'),
        },
        surface: {
          DEFAULT: colorVar('--color-surface'),
          cream: colorVar('--color-surface'),
          elevated: colorVar('--color-surface-elevated'),
        },
        primary: colorVar('--color-status-operating'),
        'primary-dark': colorVar('--color-status-operating-strong'),
        warning: colorVar('--color-status-fault'),
        maint: colorVar('--color-status-maintenance'),
        'status-operating': {
          DEFAULT: colorVar('--color-status-operating'),
          bg: colorVar('--color-status-operating-bg'),
          border: colorVar('--color-status-operating-border'),
          strong: colorVar('--color-status-operating-strong'),
        },
        'status-fault': {
          DEFAULT: colorVar('--color-status-fault'),
          bg: colorVar('--color-status-fault-bg'),
          border: colorVar('--color-status-fault-border'),
        },
        'status-maintenance': {
          DEFAULT: colorVar('--color-status-maintenance'),
          bg: colorVar('--color-status-maintenance-bg'),
          border: colorVar('--color-status-maintenance-border'),
        },
        'status-unknown': {
          DEFAULT: colorVar('--color-status-unknown'),
          bg: colorVar('--color-status-unknown-bg'),
          border: colorVar('--color-status-unknown-border'),
        },
        text: {
          primary: colorVar('--color-text-primary'),
          secondary: colorVar('--color-text-secondary'),
          main: colorVar('--color-text-primary'),
          muted: colorVar('--color-text-secondary'),
          inverse: colorVar('--color-text-inverse'),
        },
        border: {
          DEFAULT: colorVar('--color-border'),
          cream: colorVar('--color-border'),
          strong: colorVar('--color-border-strong'),
        },
        info: {
          DEFAULT: colorVar('--color-info'),
          bg: colorVar('--color-info-bg'),
          border: colorVar('--color-info-border'),
          text: colorVar('--color-info-text'),
        },
        line: {
          '1': '#0052A4',
          '2': '#009D3E',
          '3': '#EF7C1C',
          '4': '#00A5DE',
          '5': '#996CAC',
          '6': '#CD7C2F',
          '7': '#747F00',
          '8': '#E6186C',
          '9': '#BDB092',
          S: '#D4003B',
        },
      },
      boxShadow: {
        paper: '0 1px 2px rgb(var(--color-shadow-paper) / 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
