import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { buildAlternateLanguages } from '@/lib/seo';
import ArchiveContent from './ArchiveContent';

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
    title: messages.archive.title,
    description: messages.archive.description,
    alternates: { canonical: `/${locale}/archive/`, languages: buildAlternateLanguages('/archive/') },
    openGraph: {
      title: `${messages.archive.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.archive.description,
      url: `/${locale}/archive/`,
    },
    robots: { index: false, follow: true },
  };
}

export default async function ArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ArchiveContent />;
}
