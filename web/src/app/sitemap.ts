import type { MetadataRoute } from 'next';
import { STATIONS } from '@/lib/stations';

export const dynamic = 'force-static';

const SITE_URL = 'https://nadeuri.today';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/archive/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/route/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const stationPages: MetadataRoute.Sitemap = STATIONS.map((station) => ({
    url: `${SITE_URL}/station/${station.code}/`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...stationPages];
}
