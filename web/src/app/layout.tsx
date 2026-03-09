import type { Metadata } from 'next';
import Script from 'next/script';
import ThemeProvider from '@/components/ThemeProvider';
import ContactCTA from '@/components/ContactCTA';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const goatcounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

export const metadata: Metadata = {
  title: '나들이 — 오늘은 어디로 가볼까?',
  description:
    '서울 지하철 엘리베이터, 에스컬레이터 등 교통약자 편의시설의 실시간 운행 상태를 확인하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
