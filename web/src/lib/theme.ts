export const THEME_STORAGE_KEY = 'nadeuri-theme';

export const THEMES = ['light', 'dark', 'colorblind'] as const;

export type Theme = (typeof THEMES)[number];

export function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark' || value === 'colorblind';
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: Theme | null) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (theme === null) {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function getSystemTheme(): Extract<Theme, 'light' | 'dark'> {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(
  storedTheme: Theme | null,
  systemTheme: Extract<Theme, 'light' | 'dark'>,
): Theme {
  return storedTheme ?? systemTheme;
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
}

export const THEME_INIT_SCRIPT = `
(() => {
  try {
    const key = '${THEME_STORAGE_KEY}';
    const isTheme = (value) => value === 'light' || value === 'dark' || value === 'colorblind';
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const storedTheme = window.localStorage.getItem(key);
    const theme = isTheme(storedTheme) ? storedTheme : systemTheme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch {
    const root = document.documentElement;
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  }
})();
`;
