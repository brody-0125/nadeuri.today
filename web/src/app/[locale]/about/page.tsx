import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import AboutContent from './AboutContent';

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
    alternateLanguages[l] = `/${l}/about/`;
  }

  return {
    title: messages.about.title,
    description: messages.about.description,
    alternates: { canonical: `/${locale}/about/`, languages: alternateLanguages },
    openGraph: {
      title: `${messages.about.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.about.description,
      url: `/${locale}/about/`,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
