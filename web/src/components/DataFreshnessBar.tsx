'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface DataFreshnessBarProps {
  updatedAt: string;
  isStale: boolean;
}

export default function DataFreshnessBar({ updatedAt, isStale }: DataFreshnessBarProps) {
  const t = useTranslations('dataFreshness');

  const formatRelativeTime = (updatedAtStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(updatedAtStr).getTime()) / 1000);
    if (diff < 60) return t('justNow');
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return t('minutesAgo', { minutes });
    const hours = Math.floor(minutes / 60);
    return t('hoursAgo', { hours });
  };

  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(updatedAt));

  useEffect(() => {
    setRelativeTime(formatRelativeTime(updatedAt));
    const timer = setInterval(() => {
      setRelativeTime(formatRelativeTime(updatedAt));
    }, 30_000);
    return () => clearInterval(timer);
  }, [updatedAt]);

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-50 flex h-9 w-full items-center justify-center border-b border-border bg-surface/95 px-4 backdrop-blur-sm transition-all">
      <div className="flex items-center gap-2">
        {isStale ? (
          <>
            <span className="material-symbols-outlined text-base text-status-fault" aria-hidden="true">warning</span>
            <p className="font-mono text-xs font-medium tracking-tight text-status-fault sm:text-sm">
              {t('staleMessage', { time: relativeTime })}
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
