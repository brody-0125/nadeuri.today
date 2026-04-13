import type { MetadataRoute } from 'next';
import { STATIONS } from '@/lib/stations';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

const SITE_URL = 'https://nadeuri.today';
const BUILD_DATE = new Date().toISOString().split('T')[0];
const STATIC_DATE = '2025-06-01';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push(
      {
        url: `${SITE_URL}/${locale}/`,
        lastModified: BUILD_DATE,
        priority: locale === 'ko' ? 1.0 : 0.9,
      },
      {
        url: `${SITE_URL}/${locale}/faults/`,
        lastModified: BUILD_DATE,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/${locale}/about/`,
        lastModified: STATIC_DATE,
        priority: 0.5,
      },
    );

    for (const station of STATIONS) {
      entries.push({
        url: `${SITE_URL}/${locale}/station/${station.code}/`,
        lastModified: BUILD_DATE,
        priority: locale === 'ko' ? 0.8 : 0.6,
      });
    }
  }

  return entries;
}
