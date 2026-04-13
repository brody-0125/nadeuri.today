import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import AboutContent from './AboutContent';
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
    title: messages.about.title,
    description: messages.about.description,
    alternates: { canonical: `/${locale}/about/`, languages: buildAlternateLanguages('/about/') },
    openGraph: {
      title: `${messages.about.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.about.description,
      url: `/${locale}/about/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${messages.about.title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description: messages.about.description,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = messagesMap[locale] ?? koMessages;
  const homeName = locale === 'ko' ? '홈' : 'Home';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: messages.about.title,
            description: messages.about.description,
            url: `https://nadeuri.today/${locale}/about/`,
            inLanguage: locale,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: homeName, url: `/${locale}/` },
              { name: messages.about.title, url: `/${locale}/about/` },
            ]),
          ),
        }}
      />
      <AboutContent />
    </>
  );
}
