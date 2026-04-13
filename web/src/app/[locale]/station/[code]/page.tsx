import type { Metadata } from 'next';
import { STATIONS, getStation } from '@/lib/stations';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternateLanguages } from '@/lib/seo';
import StationDetailClient from './StationDetailClient';
import { STATION_NAMES_I18N } from '@/lib/station-names-i18n';
import { transitStationSchema, breadcrumbSchema } from '@/lib/schema';
import type { StationMeta } from '@/types';

import koMessages from '../../../../../messages/ko.json';
import enMessages from '../../../../../messages/en.json';
import jaMessages from '../../../../../messages/ja.json';
import zhMessages from '../../../../../messages/zh.json';

const messagesMap: Record<string, typeof koMessages> = {
  ko: koMessages, en: enMessages, ja: jaMessages, zh: zhMessages,
};

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
  const messages = messagesMap[locale] ?? koMessages;
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

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/station/${code}/`,
      languages: buildAlternateLanguages(`/station/${code}/`),
    },
    openGraph: {
      title: `${title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description,
      url: `/${locale}/station/${code}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description,
    },
  };
}

export default async function StationPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const station = getStation(code);
  const messages = messagesMap[locale] ?? koMessages;
  const homeName = locale === 'ko' ? '홈' : 'Home';

  return (
    <>
      {station && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(transitStationSchema(station, locale)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                breadcrumbSchema([
                  { name: homeName, url: `/${locale}/` },
                  { name: stationLabel(station, locale), url: `/${locale}/station/${code}/` },
                ]),
              ),
            }}
          />
        </>
      )}
      <StationDetailClient code={code} />
    </>
  );
}
