import { useLocale } from 'next-intl';
import { StationMeta } from '@/types';
import { STATION_NAMES_I18N } from '@/lib/station-names-i18n';
import { getStation } from '@/lib/stations';

/**
 * Returns the localized display name for a station.
 * Falls back to the Korean name if no translation exists.
 */
export function getStationDisplayName(code: string, locale: string): string {
  if (locale === 'ko') {
    return getStation(code)?.name ?? code;
  }
  const i18n = STATION_NAMES_I18N[code];
  if (i18n && locale in i18n) {
    return i18n[locale as keyof typeof i18n];
  }
  return getStation(code)?.name ?? code;
}

/**
 * React hook that returns the localized station name using the current locale.
 */
export function useStationName(station: StationMeta): string {
  const locale = useLocale();
  if (locale === 'ko') return station.name;
  const i18n = STATION_NAMES_I18N[station.code];
  if (i18n && locale in i18n) {
    return i18n[locale as keyof typeof i18n];
  }
  return station.name;
}
