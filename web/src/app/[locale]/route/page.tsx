import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
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

  const alternateLanguages: Record<string, string> = {};
  for (const l of locales) {
    alternateLanguages[l] = `/${l}/route/`;
  }

  return {
    title: messages.routePage.title,
    description: messages.routePage.description,
    alternates: { canonical: `/${locale}/route/`, languages: alternateLanguages },
    openGraph: {
      title: `${messages.routePage.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.routePage.description,
      url: `/${locale}/route/`,
    },
  };
}

export default async function RoutePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RouteContent />;
}
