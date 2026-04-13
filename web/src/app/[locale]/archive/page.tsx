import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import { getMessages } from '@/lib/messages';
import ArchiveContent from './ArchiveContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = getMessages(locale);

  return {
    title: messages.archive.title,
    description: messages.archive.description,
    alternates: { canonical: `/${locale}/archive/`, languages: buildAlternateLanguages('/archive/') },
    openGraph: {
      title: `${messages.archive.title} | ${messages.common.appName}`,
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
