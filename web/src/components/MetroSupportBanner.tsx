'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'nadeuri-metro-banner-dismissed';

export default function MetroSupportBanner() {
  const [dismissed, setDismissed] = useState(true);
  const t = useTranslations('banner');

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="relative flex w-full items-center justify-center gap-2 border-b border-info-border bg-info-bg px-10 py-2.5"
    >
      <span
        className="material-symbols-outlined text-base text-info"
        aria-hidden="true"
      >
        info
      </span>
      <p className="text-center text-xs font-medium text-info-text sm:text-sm">
        {t('metroSupport')}
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-info transition-colors hover:bg-info-border/30 hover:text-info-text"
        aria-label={t('dismiss')}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
      </button>
    </div>
  );
}
