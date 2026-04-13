import { locales } from '@/i18n/config';

const SITE_URL = 'https://nadeuri.today';

/**
 * Builds hreflang alternate languages map including x-default.
 * @param path - The path after the locale segment, e.g. '/' or '/station/0150/'
 */
export function buildAlternateLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}${path}`;
  }
  languages['x-default'] = `/ko${path}`;
  return languages;
}
