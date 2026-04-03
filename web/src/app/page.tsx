'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  const languages = navigator.languages ?? [navigator.language];
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }
  return defaultLocale;
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = detectLocale();
    router.replace(`/${locale}/`);
  }, [router]);

  return null;
}
