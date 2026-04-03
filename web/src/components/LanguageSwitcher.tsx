'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'EN',
  ja: '日本語',
  zh: '中文',
};

const LOCALE_FULL_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('language');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const switchLocale = (newLocale: Locale) => {
    // Replace the current locale segment in the pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 items-center gap-1.5 px-2.5 rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:text-text-primary hover:border-text-secondary text-sm"
        aria-label={t('label')}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">language</span>
        <span className="font-medium text-xs">{LOCALE_LABELS[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-border bg-surface shadow-lg z-50">
          <div className="p-1.5">
            {locales.map((l) => {
              const isSelected = locale === l;
              return (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isSelected ? 'bg-status-operating-bg text-status-operating font-medium' : 'text-text-primary hover:bg-bg'
                  }`}
                >
                  <span className="flex-1">{LOCALE_FULL_LABELS[l]}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-status-operating text-base" aria-hidden="true">check</span>
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
