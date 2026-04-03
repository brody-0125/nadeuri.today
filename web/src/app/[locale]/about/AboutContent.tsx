'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AboutContent() {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <>
      <nav className="bg-surface border-b border-border" aria-label={tCommon('topNav')}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}/`} className="flex items-center gap-2 text-status-operating hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">subway</span>
            <span className="font-serif font-bold text-xl text-text-primary tracking-tight">{tCommon('appName')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href={`/${locale}/`} className="text-sm text-text-secondary hover:text-status-operating transition-colors flex items-center gap-1">
              {tCommon('homeNav')}
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-status-operating/10 rounded-full mb-6">
            <span className="material-symbols-outlined text-status-operating text-3xl" aria-hidden="true">handshake</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-3">{t('title')}</h1>
          <p className="font-serif text-lg text-text-secondary">{t('subtitle')}</p>
        </div>

        <div className="space-y-8 text-text-primary leading-relaxed">
          <p>{t('body1')}</p>
          <p>
            {t('body2prefix')}{' '}
            <a href="https://data.seoul.go.kr" target="_blank" rel="noopener noreferrer" className="text-status-operating font-medium hover:underline">
              {t('seoulOpenData')}
            </a>
            {t('body2suffix')}
          </p>
          <p>{t('body3')}</p>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-operating" />
                <span className="text-sm font-medium text-text-primary">{t('systemStatus')}</span>
              </div>
              <span className="text-xs font-mono text-text-secondary">{t('lastCheck')}</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  <span className="material-symbols-outlined text-xs" aria-hidden="true">settings</span>
                  {t('source')}
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">{t('sourceValue')}</p>
                <span className="text-xs text-status-operating font-medium">{t('officialApi')}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  <span className="material-symbols-outlined text-xs" aria-hidden="true">category</span>
                  {t('realtimeFacilities')}
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">{t('fiveTypes')}</p>
                <span className="text-xs text-status-operating font-medium">{t('autoCollection')}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-text-secondary text-xs mb-1">
                  {t('updateInterval')}
                </div>
                <p className="font-mono text-lg font-medium text-text-primary">{t('intervalValue')}</p>
                <span className="text-xs text-text-secondary">{t('autoUpdate')}</span>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-status-maintenance bg-status-maintenance-bg rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-status-maintenance text-base" aria-hidden="true">warning</span>
              <span className="font-bold text-text-primary">{t('accuracyTitle')}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{t('accuracyBody')}</p>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-border text-center pb-8">
          <div className="flex justify-center gap-4 text-sm text-text-secondary">
            <span>{t('projectName')}</span>
            <a href="https://github.com/brody-0125/nadeuri.today" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text-primary">GitHub</a>
          </div>
        </footer>
      </main>
    </>
  );
}
