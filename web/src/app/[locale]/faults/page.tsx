import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import { getMessages } from '@/lib/messages';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/JsonLd';
import FaultsClient from './FaultsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = getMessages(locale);
  const ogTitle = `${messages.faults.title} | ${messages.common.appName}`;

  return {
    title: messages.faults.title,
    description: messages.faults.description,
    alternates: { canonical: `/${locale}/faults/`, languages: buildAlternateLanguages('/faults/') },
    openGraph: {
      title: ogTitle,
      description: messages.faults.description,
      url: `/${locale}/faults/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: messages.faults.description,
    },
  };
}

export default async function FaultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = getMessages(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: messages.common.home, url: `/${locale}/` },
          { name: messages.faults.title, url: `/${locale}/faults/` },
        ])}
      />
      <FaultsClient />
    </>
  );
}
