import type { Metadata } from 'next';
import Script from 'next/script';
import ThemeProvider from '@/components/ThemeProvider';
import ContactCTA from '@/components/ContactCTA';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const goatcounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

const SITE_URL = 'https://nadeuri.today';
const SITE_NAME = '나들이';
const SITE_DESCRIPTION =
  '서울 지하철 엘리베이터, 에스컬레이터 등 교통약자 편의시설의 실시간 운행 상태를 확인하세요. 1~9호선, 우이신설선 300개 이상 역의 편의시설 정보를 제공합니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '나들이 — 서울 지하철 교통약자 편의시설 실시간 현황',
    template: '%s | 나들이',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '서울 지하철',
    '교통약자',
    '편의시설',
    '엘리베이터',
    '에스컬레이터',
    '실시간',
    '장애인',
    '휠체어',
    '지하철 엘리베이터 고장',
    '서울 메트로',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: '나들이 — 서울 지하철 교통약자 편의시설 실시간 현황',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: '나들이 — 서울 지하철 교통약자 편의시설 실시간 현황',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700;900&family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Mono:wght@300;400;500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: 'ko',
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {recaptchaSiteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
        )}
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-status-operating focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
          >
            본문으로 바로가기
          </a>
          {children}
        </ThemeProvider>
        <ContactCTA />
        {goatcounterCode && (
          <Script
            data-goatcounter={`https://${goatcounterCode}.goatcounter.com/count`}
            src="//gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
