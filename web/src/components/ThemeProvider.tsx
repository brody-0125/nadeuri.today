'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  Theme,
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  isTheme,
  resolveTheme,
  setStoredTheme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const currentTheme = document.documentElement.dataset.theme;
    if (isTheme(currentTheme)) {
      return currentTheme;
    }
  }

  return resolveTheme(getStoredTheme(), getSystemTheme());
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = useState<Theme | null>(() => getStoredTheme());
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    const resolvedTheme = resolveTheme(themePreference, getSystemTheme());
    setThemeState(resolvedTheme);
    applyTheme(resolvedTheme);
  }, [themePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      if (themePreference !== null) {
        return;
      }

      const resolvedTheme = resolveTheme(null, mediaQuery.matches ? 'dark' : 'light');
      setThemeState(resolvedTheme);
      applyTheme(resolvedTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themePreference]);

  const handleThemeChange = (nextTheme: Theme | null) => {
    setStoredTheme(nextTheme);
    setThemePreference(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}
