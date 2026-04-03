'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function RouteContent() {
  const t = useTranslations('routePage');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <>
      <nav className="bg-surface-cream border-b border-border-cream" aria-label={tCommon('topNav')}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}/`} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">subway</span>
            <span className="font-serif font-bold text-xl text-text-main tracking-tight">{tCommon('appName')}</span>
          </Link>
          <Link href={`/${locale}/`} className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-1">
            {tCommon('backToDashboard')}
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
          <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">map</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-text-main mb-3">{t('title')}</h1>
        <p className="font-serif text-lg text-text-muted italic mb-8">{tCommon('comingSoon')}</p>
        <div className="bg-surface-cream border border-border-cream rounded-lg p-8 text-left max-w-md mx-auto">
          <p className="text-text-main text-sm leading-relaxed">{t('body')}</p>
        </div>
      </main>
    </>
  );
}
