import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import FaultsClient from './FaultsClient';
import { breadcrumbSchema } from '@/lib/schema';

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
    title: messages.faults.title,
    description: messages.faults.description,
    alternates: { canonical: `/${locale}/faults/`, languages: buildAlternateLanguages('/faults/') },
    openGraph: {
      title: `${messages.faults.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.faults.description,
      url: `/${locale}/faults/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${messages.faults.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.faults.description,
    },
  };
}

export default async function FaultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = messagesMap[locale] ?? koMessages;
  const homeName = locale === 'ko' ? '홈' : 'Home';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: homeName, url: `/${locale}/` },
              { name: messages.faults.title, url: `/${locale}/faults/` },
            ]),
          ),
        }}
      />
      <FaultsClient />
    </>
  );
}
