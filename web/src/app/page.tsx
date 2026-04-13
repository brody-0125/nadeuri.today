import type { Metadata } from 'next';
import { defaultLocale } from '@/i18n/config';
import RootRedirect from './RootRedirect';

export const metadata: Metadata = {
  title: '나들이 — 서울 지하철 교통약자 편의시설 실시간 현황',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `https://nadeuri.today/${defaultLocale}/`,
  },
};

export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}/`} />
      <RootRedirect />
      <noscript>
        <p>
          <a href={`/${defaultLocale}/`}>나들이 — 서울 지하철 편의시설 실시간 현황</a>
        </p>
      </noscript>
    </>
  );
}
