'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LatestData, StationStatus, FacilityType, FacilitySummary } from '@/types';
import { fetchLatest } from '@/lib/data';
import { getStation } from '@/lib/stations';
import DataFreshnessBar from '@/components/DataFreshnessBar';
import FacilityBadge from '@/components/FacilityBadge';
import ExternalMapLinks from '@/components/ExternalMapLinks';
import DevSettingsPanel from '@/components/DevSettingsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const FACILITY_TYPE_KEYS: Record<FacilityType, string> = {
  elevator: 'elevator',
  escalator: 'escalator',
  moving_walk: 'movingWalk',
  wheelchair_lift: 'wheelchairLift',
  safety_board: 'safetyBoard',
};

const STATIC_FACILITY_KEYS: Record<string, string> = {
  disabled_restroom: 'disabledRestroom',
  sign_language_phone: 'signLanguagePhone',
  wheelchair_charger: 'wheelchairCharger',
  helper: 'helper',
};

const FACILITY_TYPES: FacilityType[] = [
  'elevator', 'escalator', 'moving_walk', 'wheelchair_lift', 'safety_board',
];

const STATIC_TYPES = [
  'disabled_restroom', 'sign_language_phone', 'wheelchair_charger', 'helper',
] as const;

const FACILITY_TYPE_ICONS: Record<FacilityType, string> = {
  elevator: 'elevator',
  escalator: 'escalator',
  moving_walk: 'directions_walk',
  wheelchair_lift: 'accessible',
  safety_board: 'security',
};

function sortFacilities(facilities: FacilitySummary[]): FacilitySummary[] {
  return [...facilities].sort((a, b) => {
    if (a.status === 'FAULT' && b.status !== 'FAULT') return -1;
    if (a.status !== 'FAULT' && b.status === 'FAULT') return 1;
    if (a.status === 'MAINTENANCE' && b.status !== 'MAINTENANCE') return -1;
    if (a.status !== 'MAINTENANCE' && b.status === 'MAINTENANCE') return 1;
    return 0;
  });
}

export default function StationDetailClient({ code }: { code: string }) {
  const station = getStation(code);
  const t = useTranslations('station');
  const tFacility = useTranslations('facility');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tError = useTranslations('error');
  const tHome = useTranslations('home');
  const locale = useLocale();

  const [data, setData] = useState<LatestData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setData(null);
    setError(null);
    fetchLatest()
      .then(setData)
      .catch(() => setError(tError('fetchFailed')));
  }, [tError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stationStatus: StationStatus | undefined = data?.stations[code];

  if (!station) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        <p className="text-text-secondary mb-4">{t('notFound')}</p>
        <Link href={`/${locale}/`} className="text-status-operating font-medium hover:underline">
          {t('backHome')}
        </Link>
      </div>
    );
  }

  const hasFault = stationStatus
    ? FACILITY_TYPES.some((type) =>
        stationStatus.facilities[type]?.some((f) => f.status === 'FAULT' || f.status === 'MAINTENANCE')
      )
    : false;

  const faultDetails = stationStatus
    ? FACILITY_TYPES.flatMap((type) =>
        (stationStatus.facilities[type] ?? [])
          .filter((f) => f.status === 'FAULT' || f.status === 'MAINTENANCE')
          .map((f) => ({ ...f, type }))
      )
    : [];

  function humanFacilityName(id: string, type: FacilityType): string {
    const match = id.match(/(\d+)/);
    const num = match ? `#${parseInt(match[1], 10)}` : id;
    return `${num} ${tFacility(FACILITY_TYPE_KEYS[type] as 'elevator')}`;
  }

  const statusLabels: Record<string, string> = {
    OPERATING: tStatus('operating'),
    FAULT: tStatus('fault'),
    MAINTENANCE: tStatus('maintenance'),
    UNKNOWN: tStatus('unknown'),
  };

  return (
    <>
      <div className="bg-status-operating text-white">
        {data && <DataFreshnessBar updatedAt={data.updated_at} isStale={data.is_stale} />}
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <Link href={`/${locale}/`} className="text-[13px] text-white/75 flex items-center gap-1 hover:text-white transition-colors">
              {t('backHomeShort')}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <h1 className="font-serif font-black text-[28px] leading-tight mb-1.5">{station.name}</h1>
          <div className="flex items-center gap-2">
            {station.lines.map((line) => (
              <span key={line} className="bg-white/25 rounded-full px-2.5 py-0.5 text-[12px] font-medium">
                {tHome('lineN', { line })}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 md:px-8 py-0">
        {error && (
          <div className="bg-status-fault/10 border border-status-fault/20 text-status-fault rounded-xl p-5 mt-4 mb-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" role="alert">
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-status-fault/70 text-xs mt-1">{tError('devHint')}</p>
            </div>
            <button onClick={loadData} className="shrink-0 px-4 py-2 bg-status-fault text-white text-sm font-medium rounded-sm hover:bg-status-fault/90 transition-colors">
              {tCommon('retry')}
            </button>
          </div>
        )}

        {!data && !error && (
          <div role="status" aria-label={tCommon('loading')} className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-status-operating/30 border-t-status-operating rounded-full animate-spin" aria-hidden="true" />
            <p className="text-text-secondary text-sm">{tCommon('loadingMessage')}</p>
          </div>
        )}

        {data && stationStatus && (
          <>
            {hasFault && (
              <div className="bg-status-fault-bg border border-status-fault-border rounded-xl p-4 mt-4 flex gap-3 items-start">
                <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
                <div className="text-[13px] leading-relaxed text-status-fault">
                  <strong>
                    {faultDetails.length === 1
                      ? t('faultBannerSingle', { type: tFacility(FACILITY_TYPE_KEYS[faultDetails[0].type] as 'elevator') })
                      : t('faultBannerMultiple', { count: faultDetails.length })}
                  </strong>
                  <br />
                  {faultDetails.map((f) => f.location_detail || humanFacilityName(f.facility_id, f.type)).join(', ')}
                  {' '}{t('faultBannerSuffix')}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-2">{t('externalMaps')}</p>
              <ExternalMapLinks station={station} />
            </div>

            <hr className="border-border my-4" />

            <div className="space-y-6 pb-6">
              {FACILITY_TYPES.map((type) => {
                const facilities = stationStatus.facilities[type];
                const sorted = facilities ? sortFacilities(facilities) : [];
                if (sorted.length === 0) return null;
                const label = tFacility(FACILITY_TYPE_KEYS[type] as 'elevator');
                return (
                  <section key={type} aria-label={label}>
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-3">{label}</p>
                    <div className="space-y-2">
                      {sorted.map((facility) => {
                        const isFault = facility.status === 'FAULT';
                        const isMaint = facility.status === 'MAINTENANCE';
                        return (
                          <div key={facility.facility_id}
                            className={`bg-surface border border-border rounded-xl p-4 ${
                              isFault ? 'border-l-[3px] border-l-status-fault' : isMaint ? 'border-l-[3px] border-l-status-maintenance' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-text-secondary text-lg" aria-hidden="true">{FACILITY_TYPE_ICONS[type]}</span>
                                <span className="font-serif font-semibold text-[14px] text-text-primary">{humanFacilityName(facility.facility_id, type)}</span>
                              </div>
                              <FacilityBadge status={facility.status} label={statusLabels[facility.status] ?? tStatus('unknown')} />
                            </div>
                            <p className="text-[12px] text-text-secondary ml-7">
                              {facility.location_detail || t('noLocation')}
                              {facility.floor_from && facility.floor_to && ` · ${facility.floor_from} ↔ ${facility.floor_to}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <section>
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-3">{t('otherFacilities')}</p>
                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  {STATIC_TYPES.map((type) => {
                    const items = stationStatus[type];
                    const hasItems = items && Array.isArray(items) && items.length > 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{tFacility(STATIC_FACILITY_KEYS[type] as 'disabledRestroom')}</span>
                        {hasItems ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-operating-bg text-status-operating text-[11px] font-medium">
                            <span className="w-[5px] h-[5px] rounded-full bg-current" />
                            {t('available')}
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary">{t('unavailable')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      <DevSettingsPanel onSettingsChange={loadData} />
    </>
  );
}
