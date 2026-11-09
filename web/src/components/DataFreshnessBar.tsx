'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LatestData } from '@/types';
import { FRESHNESS_REFRESH_MS, getDataFreshness } from '@/lib/freshness';

interface DataFreshnessBarProps {
  data: LatestData;
}

export default function DataFreshnessBar({ data }: DataFreshnessBarProps) {
  const t = useTranslations('dataFreshness');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = setInterval(refresh, FRESHNESS_REFRESH_MS);
    // Background tabs can throttle timers. Refresh immediately on return.
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [data]);

  const { isStale, ageMinutes, hasUnknownTime } = getDataFreshness(data, now);
  const relativeTime = ageMinutes === null ? t('unknownTime')
    : ageMinutes < 1 ? t('justNow')
    : ageMinutes < 60 ? t('minutesAgo', { minutes: ageMinutes })
    : t('hoursAgo', { hours: Math.floor(ageMinutes / 60) });

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 flex h-9 w-full items-center justify-center border-b border-border bg-surface/95 px-4 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-2">
        {isStale ? (
          <>
            <span className="material-symbols-outlined text-base text-status-fault" aria-hidden="true">warning</span>
            <p className="font-mono text-xs font-medium tracking-tight text-status-fault sm:text-sm">
              {hasUnknownTime ? t('unknownMessage') : t('staleMessage', { time: relativeTime })}
            </p>
          </>
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-operating opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-operating" />
            </span>
            <p className="font-mono text-xs font-medium tracking-tight text-text-secondary sm:text-sm">
              {t('liveMessage', { time: relativeTime })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
