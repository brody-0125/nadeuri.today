import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { buildAlternateLanguages } from '@/lib/seo';
import RouteContent from './RouteContent';

import koMessages from '../../../../messages/ko.json';
import enMessages from '../../../../messages/en.json';
import jaMessages from '../../../../messages/ja.json';
import zhMessages from '../../../../messages/zh.json';

const messagesMap: Record<string, typeof koMessages> = {
  ko: koMessages, en: enMessages, ja: jaMessages, zh: zhMessages,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = messagesMap[locale] ?? koMessages;

  return {
    title: messages.routePage.title,
    description: messages.routePage.description,
    alternates: { canonical: `/${locale}/route/`, languages: buildAlternateLanguages('/route/') },
    openGraph: {
      title: `${messages.routePage.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.routePage.description,
      url: `/${locale}/route/`,
    },
    robots: { index: false, follow: true },
  };
}

export default async function RoutePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RouteContent />;
}
