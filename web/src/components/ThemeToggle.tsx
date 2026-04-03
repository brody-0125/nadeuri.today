'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Theme } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('theme');

  const OPTIONS: Array<{ value: Theme; labelKey: 'light' | 'dark' | 'colorblind'; descKey: 'lightDesc' | 'darkDesc' | 'colorblindDesc'; icon: string }> = [
    { value: 'light', labelKey: 'light', descKey: 'lightDesc', icon: 'light_mode' },
    { value: 'dark', labelKey: 'dark', descKey: 'darkDesc', icon: 'dark_mode' },
    { value: 'colorblind', labelKey: 'colorblind', descKey: 'colorblindDesc', icon: 'contrast' },
  ];

  const THEME_ICONS: Record<Theme, string> = {
    light: 'light_mode',
    dark: 'dark_mode',
    colorblind: 'contrast',
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:text-text-primary hover:border-text-secondary"
        aria-label={t('settings')}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{THEME_ICONS[theme]}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface shadow-lg z-50"
          role="radiogroup"
          aria-label={t('select')}
        >
          <div className="p-2">
            {OPTIONS.map((opt) => {
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-status-operating-bg'
                      : 'hover:bg-bg'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg mt-0.5 ${
                    isSelected ? 'text-status-operating' : 'text-text-secondary'
                  }`} aria-hidden="true">
                    {opt.icon}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${
                      isSelected ? 'text-status-operating' : 'text-text-primary'
                    }`}>
                      {t(opt.labelKey)}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{t(opt.descKey)}</p>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-status-operating text-lg ml-auto mt-0.5" aria-hidden="true">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
