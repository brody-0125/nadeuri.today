import type { StationMeta } from '@/types';
import { STATION_NAMES_I18N } from '@/lib/station-names-i18n';
import { SITE_URL } from '@/lib/constants';

export function websiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: locale === 'ko' ? '나들이' : 'Nadeuri',
    alternateName: locale === 'ko' ? 'Nadeuri' : '나들이',
    url: `${SITE_URL}/${locale}/`,
    description:
      locale === 'ko'
        ? '서울 지하철 엘리베이터, 에스컬레이터 등 교통약자 편의시설의 실시간 운행 상태를 확인하세요.'
        : 'Real-time accessibility facility status monitoring for Seoul Metro.',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/${locale}/station/{station_code}`,
      },
      'query-input': 'required name=station_code',
    },
  };
}

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '나들이',
  alternateName: 'Nadeuri',
  url: SITE_URL,
  sameAs: ['https://github.com/brody-0125/nadeuri.today'],
} as const;

const AMENITIES_KO = [
  { name: '엘리베이터' },
  { name: '에스컬레이터' },
  { name: '무빙워크' },
  { name: '휠체어리프트' },
  { name: '안전발판' },
];

const AMENITIES_EN = [
  { name: 'Elevator' },
  { name: 'Escalator' },
  { name: 'Moving Walk' },
  { name: 'Wheelchair Lift' },
  { name: 'Safety Board' },
];

export function transitStationSchema(station: StationMeta, locale: string) {
  const i18n = STATION_NAMES_I18N[station.code];
  const localizedName =
    locale === 'ko'
      ? station.name
      : i18n?.[locale as 'en' | 'ja' | 'zh'] ?? station.name;
  const alternateName =
    locale === 'ko'
      ? i18n?.en ?? undefined
      : station.name;

  const amenities = locale === 'ko' ? AMENITIES_KO : AMENITIES_EN;

  return {
    '@context': 'https://schema.org',
    '@type': 'SubwayStation',
    name: localizedName,
    ...(alternateName ? { alternateName } : {}),
    url: `${SITE_URL}/${locale}/station/${station.code}/`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: station.lat,
      longitude: station.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: locale === 'ko' ? '서울' : 'Seoul',
      addressCountry: 'KR',
    },
    amenityFeature: amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a.name,
      value: true,
    })),
    isAccessibleForFree: true,
    publicAccess: true,
  };
}

export function aboutPageSchema(title: string, description: string, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url: `${SITE_URL}/${locale}/about/`,
    inLanguage: locale,
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
