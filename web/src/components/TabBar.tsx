'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function TabBar() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const locale = useLocale();

  const TABS = [
    { href: `/${locale}/`, label: t('home'), icon: '🏠' },
    { href: `/${locale}/?search=1`, label: t('search'), icon: '🔍' },
    { href: `/${locale}/route/`, label: t('route'), icon: '🗺️' },
    { href: `/${locale}/about/`, label: t('data'), icon: 'ℹ️' },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:hidden h-[60px] bg-surface border-t border-border flex items-center z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      aria-label={t('mainNav')}
    >
      {TABS.map((tab) => {
        const isActive =
          tab.href === `/${locale}/`
            ? pathname === `/${locale}/` || pathname === `/${locale}`
            : pathname.startsWith(tab.href.split('?')[0]);

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] py-1.5 relative"
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-[21px]" aria-hidden="true">{tab.icon}</span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-status-operating' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-status-operating" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
