'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LatestData, FacilityType } from '@/types';
import { fetchLatest } from '@/lib/data';
import { STATIONS, LINES } from '@/lib/stations';
import StationCard from '@/components/StationCard';
import ThemeToggle from '@/components/ThemeToggle';
import DataFreshnessBar from '@/components/DataFreshnessBar';
import DevSettingsPanel from '@/components/DevSettingsPanel';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const FACILITY_TYPES: FacilityType[] = [
  'elevator', 'escalator', 'moving_walk', 'wheelchair_lift', 'safety_board',
];

const LINE_COLORS: Record<string, string> = {
  '1': 'bg-line-1', '2': 'bg-line-2', '3': 'bg-line-3', '4': 'bg-line-4',
  '5': 'bg-line-5', '6': 'bg-line-6', '7': 'bg-line-7', '8': 'bg-line-8', '9': 'bg-line-9',
};

const LINE_TEXT_COLORS: Record<string, string> = {
  '1': 'text-line-1', '2': 'text-line-2', '3': 'text-line-3', '4': 'text-line-4',
  '5': 'text-line-5', '6': 'text-line-6', '7': 'text-line-7', '8': 'text-line-8', '9': 'text-line-9',
};

function hasFaultStation(data: LatestData, code: string): boolean {
  const st = data.stations[code];
  if (!st) return false;
  return FACILITY_TYPES.some((type) =>
    st.facilities[type]?.some((f) => f.status === 'FAULT' || f.status === 'MAINTENANCE'),
  );
}

function countFaults(data: LatestData, code: string): number {
  const st = data.stations[code];
  if (!st) return 0;
  return FACILITY_TYPES.reduce(
    (acc, type) => acc + (st.facilities[type]?.filter((f) => f.status === 'FAULT').length ?? 0),
    0,
  );
}

export default function FaultsClient() {
  const t = useTranslations('faults');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const tError = useTranslations('error');
  const locale = useLocale();

  const [data, setData] = useState<LatestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

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

  const faultStations = useMemo(() => {
    if (!data) return [];
    return STATIONS.filter((s) => hasFaultStation(data, s.code))
      .sort((a, b) => countFaults(data, b.code) - countFaults(data, a.code));
  }, [data]);

  const filteredStations = useMemo(() => {
    if (!selectedLine) return faultStations;
    return faultStations.filter((s) => s.lines.includes(selectedLine));
  }, [faultStations, selectedLine]);

  const lineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const line of LINES) {
      counts[line] = faultStations.filter((s) => s.lines.includes(line)).length;
    }
    return counts;
  }, [faultStations]);

  return (
    <>
      {data && <DataFreshnessBar updatedAt={data.updated_at} isStale={data.is_stale} />}

      <nav className="bg-surface border-b border-border" aria-label={tCommon('topNav')}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}/`} className="flex items-center gap-2 text-status-operating hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">subway</span>
            <span className="font-serif font-bold text-xl text-text-primary tracking-tight">{tCommon('appName')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href={`/${locale}/`} className="text-sm text-text-secondary hover:text-status-operating transition-colors flex items-center gap-1">
              {tCommon('homeNav')}
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-5">
        <div>
          <h1 className="font-serif text-xl font-bold text-text-primary mb-1">⚠ {t('title')}</h1>
          <p className="text-[13px] text-text-secondary">
            {data ? (
              <>{t('count', { count: faultStations.length })}</>
            ) : (
              t('loadingData')
            )}
          </p>
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-status-fault-border bg-status-fault-bg p-4 text-sm text-status-fault" role="alert">
            <div>
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-xs text-status-fault/70">{tError('devHint')}</p>
            </div>
            <button onClick={loadData} className="self-start rounded-sm bg-status-fault px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-fault/90">
              {tCommon('retry')}
            </button>
          </div>
        )}

        {!data && !error && (
          <div role="status" aria-label={tCommon('loading')} className="space-y-3">
            <p className="sr-only">{tCommon('loadingMessage')}</p>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" role="tablist" aria-label={tHome('lineFilter')}>
              <button role="tab" aria-selected={selectedLine === null} onClick={() => setSelectedLine(null)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors min-h-[44px] ${
                  selectedLine === null ? 'bg-status-fault text-white' : 'bg-surface-elevated border border-border text-text-secondary'
                }`}
              >
                {t('all')}
              </button>
              {LINES.map((line) => (
                <button key={line} role="tab" aria-selected={selectedLine === line} onClick={() => setSelectedLine(selectedLine === line ? null : line)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors min-h-[44px] ${
                    selectedLine === line ? `${LINE_COLORS[line]} text-white` : `bg-surface-elevated border border-border ${LINE_TEXT_COLORS[line]}`
                  }`}
                >
                  {tHome('lineN', { line })}
                  {lineCounts[line] > 0 && (
                    <span className={`ml-1 ${selectedLine === line ? 'text-white/80' : 'text-text-secondary'}`}>{lineCounts[line]}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredStations.map((station) => (
                <StationCard key={station.code} station={station} status={data.stations[station.code]} compact />
              ))}
              {filteredStations.length === 0 && (
                <div className="py-12 text-center md:col-span-2">
                  <p className="text-3xl mb-3" aria-hidden="true">✅</p>
                  <p className="font-serif text-base font-bold text-text-primary mb-1">
                    {selectedLine ? t('noFaultsLine', { line: selectedLine }) : t('noFaults')}
                  </p>
                  <p className="text-[13px] text-text-secondary">{t('allOperating')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <DevSettingsPanel onSettingsChange={loadData} />
    </>
  );
}
