'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nadeuri-metro-banner-dismissed';

export default function MetroSupportBanner() {
  const [dismissed, setDismissed] = useState(true);

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
      className="relative flex w-full items-center justify-center gap-2 border-b border-blue-200 bg-blue-50 px-10 py-2.5 dark:border-blue-500/20 dark:bg-blue-950/40"
    >
      <span
        className="material-symbols-outlined text-base text-blue-500 dark:text-blue-400"
        aria-hidden="true"
      >
        info
      </span>
      <p className="text-center text-xs font-medium text-blue-700 dark:text-blue-300 sm:text-sm">
        현재 서울 지하철 1~9호선만 지원하고 있어요. 다른 노선도 곧 만나요!
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
        aria-label="배너 닫기"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
      </button>
    </div>
  );
}
