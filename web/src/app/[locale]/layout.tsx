import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Script from 'next/script';
import ThemeProvider from '@/components/ThemeProvider';
import ContactCTA from '@/components/ContactCTA';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { locales, type Locale } from '@/i18n/config';
import { buildAlternateLanguages } from '@/lib/seo';
import '../globals.css';

import koMessages from '../../../messages/ko.json';
import enMessages from '../../../messages/en.json';
import jaMessages from '../../../messages/ja.json';
import zhMessages from '../../../messages/zh.json';

const messagesMap: Record<string, typeof koMessages> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
};

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const goatcounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

const SITE_URL = 'https://nadeuri.today';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = messagesMap[locale] ?? koMessages;
  const meta = messages.meta;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      template: meta.titleTemplate,
    },
    description: meta.description,
    alternates: {
      canonical: `/${locale}/`,
      languages: buildAlternateLanguages('/'),
    },
    openGraph: {
      type: 'website',
      siteName: locale === 'ko' ? '나들이' : 'Nadeuri',
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}/`,
      locale: locale === 'ko' ? 'ko_KR' : locale === 'ja' ? 'ja_JP' : locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: locale === 'ko' ? '나들이 — 서울 지하철 편의시설 실시간 현황' : 'Nadeuri — Seoul Metro Accessibility Status',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/og-image.png'],
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = messagesMap[locale] ?? koMessages;

  const fontUrl =
    'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700;900&family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Mono:wght@300;400;500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontUrl} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {recaptchaSiteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-status-operating focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
            >
              {messages.common.skipToMain}
            </a>
            {children}
          </ThemeProvider>
          <ContactCTA />
        </NextIntlClientProvider>
        {goatcounterCode && (
          <Script
            data-goatcounter={`https://${goatcounterCode}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
