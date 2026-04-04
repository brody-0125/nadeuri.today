import type { Metadata } from 'next';
import { STATIONS, getStation } from '@/lib/stations';
import { getStationDisplayName } from '@/lib/station-i18n';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import StationDetailClient from './StationDetailClient';

import koMessages from '../../../../../messages/ko.json';
import enMessages from '../../../../../messages/en.json';
import jaMessages from '../../../../../messages/ja.json';
import zhMessages from '../../../../../messages/zh.json';

const messagesMap: Record<string, typeof koMessages> = {
  ko: koMessages, en: enMessages, ja: jaMessages, zh: zhMessages,
};

function stationLabel(name: string, locale: string): string {
  if (locale === 'ko') return name.endsWith('역') ? name : `${name}역`;
  return name;
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
  const label = stationLabel(getStationDisplayName(code, locale), locale);
  const title = messages.station.facilityTitle.replace('{name}', label);
  const description = messages.station.facilityDescription
    .replace('{name}', label)
    .replace('{lines}', lineText);

  const alternateLanguages: Record<string, string> = {};
  for (const l of locales) {
    alternateLanguages[l] = `/${l}/station/${code}/`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/station/${code}/`,
      languages: alternateLanguages,
    },
    openGraph: {
      title: `${title} | ${locale === 'ko' ? '나들이' : 'Nadeuri'}`,
      description,
      url: `/${locale}/station/${code}/`,
    },
  };
}

export default async function StationPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  return <StationDetailClient code={code} />;
}
