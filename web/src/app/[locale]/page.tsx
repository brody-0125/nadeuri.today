import { setRequestLocale } from 'next-intl/server';
import HomeClient from './HomeClient';
import JsonLd from '@/components/JsonLd';
import { websiteSchema, ORGANIZATION_SCHEMA } from '@/lib/schema';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <JsonLd data={[websiteSchema(locale), ORGANIZATION_SCHEMA]} />
      <HomeClient />
    </>
  );
}
