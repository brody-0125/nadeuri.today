import { StationMeta } from '@/types';
import { STATION_NAMES_I18N } from '@/lib/station-names-i18n';

/**
 * Returns the Korean name as subtitle for co-display (병기) in non-Korean locales.
 * Returns undefined for Korean locale or when no translation is available.
 */
export function getStationSubtitle(station: StationMeta, locale: string): string | undefined {
  if (locale === 'ko') return undefined;
  const i18n = STATION_NAMES_I18N[station.code];
  if (i18n && locale in i18n) {
    return station.name;
  }
  return undefined;
}
