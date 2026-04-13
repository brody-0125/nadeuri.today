import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import { getMessages } from '@/lib/messages';
import RouteContent from './RouteContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = getMessages(locale);

  return {
    title: messages.routePage.title,
    description: messages.routePage.description,
    alternates: { canonical: `/${locale}/route/`, languages: buildAlternateLanguages('/route/') },
    openGraph: {
      title: `${messages.routePage.title} | ${messages.common.appName}`,
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
