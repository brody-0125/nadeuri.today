import type { MetadataRoute } from 'next';
import { STATIONS } from '@/lib/stations';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

const SITE_URL = 'https://nadeuri.today';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Static pages
    entries.push(
      {
        url: `${SITE_URL}/${locale}/`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: locale === 'ko' ? 1.0 : 0.9,
      },
      {
        url: `${SITE_URL}/${locale}/faults/`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/${locale}/about/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/${locale}/archive/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/${locale}/route/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
    );

    // Station pages
    for (const station of STATIONS) {
      entries.push({
        url: `${SITE_URL}/${locale}/station/${station.code}/`,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 0.8,
      });
    }
  }

  return entries;
}
