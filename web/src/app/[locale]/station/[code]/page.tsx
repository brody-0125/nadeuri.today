import type { Metadata } from 'next';
import { STATIONS, getStation } from '@/lib/stations';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import { getMessages } from '@/lib/messages';
import { transitStationSchema, breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/components/JsonLd';
import StationDetailClient from './StationDetailClient';
import { STATION_NAMES_I18N } from '@/lib/station-names-i18n';
import type { StationMeta } from '@/types';

function stationLabel(station: StationMeta, locale: string): string {
  if (locale === 'ko') return station.name.endsWith('역') ? station.name : `${station.name}역`;
  const localized = STATION_NAMES_I18N[station.code]?.[locale as 'en' | 'ja' | 'zh'];
  if (!localized) return station.name;
  return `${localized} (${station.name})`;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIONS.map((s) => ({ code: s.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const messages = getMessages(locale);
  const station = getStation(code);

  if (!station) {
    return { title: messages.station.notFoundTitle };
  }

  const lineText = station.lines.map((l) => messages.home.lineN.replace('{line}', l)).join(' · ');
  const label = stationLabel(station, locale);
  const title = messages.station.facilityTitle.replace('{name}', label);
  const description = messages.station.facilityDescription
    .replace('{name}', label)
    .replace('{lines}', lineText);
  const ogTitle = `${title} | ${messages.common.appName}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/station/${code}/`,
      languages: buildAlternateLanguages(`/station/${code}/`),
    },
    openGraph: {
      title: ogTitle,
      description,
      url: `/${locale}/station/${code}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
    },
  };
}

export default async function StationPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const station = getStation(code);
  const messages = getMessages(locale);

  return (
    <>
      {station && (
        <JsonLd
          data={[
            transitStationSchema(station, locale),
            breadcrumbSchema([
              { name: messages.common.home, url: `/${locale}/` },
              { name: stationLabel(station, locale), url: `/${locale}/station/${code}/` },
            ]),
          ]}
        />
      )}
      <StationDetailClient code={code} />
    </>
  );
}
