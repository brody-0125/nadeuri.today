import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import FaultsClient from './FaultsClient';

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
    alternateLanguages[l] = `/${l}/faults/`;
  }

  return {
    title: messages.faults.title,
    description: messages.faults.description,
    alternates: { canonical: `/${locale}/faults/`, languages: alternateLanguages },
    openGraph: {
      title: `${messages.faults.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.faults.description,
      url: `/${locale}/faults/`,
    },
  };
}

export default async function FaultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaultsClient />;
}
