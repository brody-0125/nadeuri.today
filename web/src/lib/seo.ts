import { locales } from '@/i18n/config';

/**
 * Builds hreflang alternate languages map including x-default.
 */
export function buildAlternateLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `/${l}${path}`;
  }
  languages['x-default'] = `/ko${path}`;
  return languages;
}
