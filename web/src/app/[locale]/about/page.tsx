import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import { getMessages } from '@/lib/messages';
import { aboutPageSchema, breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/JsonLd';
import AboutContent from './AboutContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = getMessages(locale);
  const ogTitle = `${messages.about.title} | ${messages.common.appName}`;

  return {
    title: messages.about.title,
    description: messages.about.description,
    alternates: { canonical: `/${locale}/about/`, languages: buildAlternateLanguages('/about/') },
    openGraph: {
      title: ogTitle,
      description: messages.about.description,
      url: `/${locale}/about/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: messages.about.description,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = getMessages(locale);

  return (
    <>
      <JsonLd
        data={[
          aboutPageSchema(messages.about.title, messages.about.description, locale),
          breadcrumbSchema([
            { name: messages.common.home, url: `/${locale}/` },
            { name: messages.about.title, url: `/${locale}/about/` },
          ]),
        ]}
      />
      <AboutContent />
    </>
  );
}
