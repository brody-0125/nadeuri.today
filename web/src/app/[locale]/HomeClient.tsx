'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { LatestData, FacilityType, StationMeta } from '@/types';
import { fetchLatest } from '@/lib/data';
import { searchStations, STATIONS, LINES, getStationsByLine } from '@/lib/stations';
import SearchInput from '@/components/SearchInput';
import StationCard from '@/components/StationCard';
import EnvironmentBanner from '@/components/EnvironmentBanner';
import StatusSummaryBar from '@/components/StatusSummaryBar';
import DataFreshnessBar from '@/components/DataFreshnessBar';
import DevSettingsPanel from '@/components/DevSettingsPanel';
import MetroSupportBanner from '@/components/MetroSupportBanner';
import { SummarySkeleton, AlertsSkeleton } from '@/components/LoadingSkeleton';
import ThemeToggle from '@/components/ThemeToggle';
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

export default function HomeClient() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tError = useTranslations('error');
  const tFooter = useTranslations('footer');
  const locale = useLocale();

  const [data, setData] = useState<LatestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);

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

  const hasQuery = query.trim().length > 0;
  const isSingleLineNumber = /^[1-9]$/.test(query.trim());
  const isSearching = query.trim().length >= 2 || isSingleLineNumber;
  const filteredStations = isSearching ? searchStations(query) : [];

  const faultStations = useMemo(() => {
    if (!data) return [];
    return STATIONS.filter((s) => hasFaultStation(data, s.code))
      .sort((a, b) => countFaults(data, b.code) - countFaults(data, a.code));
  }, [data]);

  const displayStations = useMemo(() => {
    if (!selectedLine) return [];
    let list = getStationsByLine(selectedLine);
    if (showIssuesOnly && data) {
      list = list.filter((s) => hasFaultStation(data, s.code));
    }
    return list;
  }, [selectedLine, showIssuesOnly, data]);

  return (
    <>
      <MetroSupportBanner />
      {data && <DataFreshnessBar updatedAt={data.updated_at} isStale={data.is_stale} />}

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-8 flex flex-col gap-6 py-6">
        {/* Header */}
        {!hasQuery && (
          <header className="pt-2">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-status-operating">
                <span className="material-symbols-outlined text-white text-[17px]" aria-hidden="true">subway</span>
              </div>
              <h1 className="font-serif font-bold text-[21px] tracking-tight text-text-primary flex-1">{tCommon('appName')}</h1>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <p className="mb-5 font-serif text-[13px] text-text-secondary">{t('tagline')}</p>
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <SearchInput value={query} onChange={setQuery} />
            </form>
          </header>
        )}

        {/* 1-char guidance */}
        {query.trim().length === 1 && !isSingleLineNumber && (
          <section>
            <nav className="flex items-center gap-4 mb-6">
              <button onClick={() => setQuery('')} className="flex items-center gap-2 text-status-operating transition-opacity hover:opacity-80">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-status-operating">
                  <span className="material-symbols-outlined text-white text-[17px]" aria-hidden="true">subway</span>
                </div>
                <span className="font-serif font-bold text-[17px] tracking-tight text-text-primary">{tCommon('appName')}</span>
              </button>
              <form role="search" onSubmit={(e) => e.preventDefault()} className="flex-1">
                <SearchInput value={query} onChange={setQuery} compact />
              </form>
              <ThemeToggle />
            </nav>
            <div className="py-12 text-center">
              <p className="text-4xl mb-3" aria-hidden="true">✏️</p>
              <p className="mb-2 font-serif text-base font-bold text-text-primary">{t('typeMoreToSearch')}</p>
            </div>
          </section>
        )}

        {/* Search Mode */}
        {isSearching && (
          <section>
            <nav className="flex items-center gap-4 mb-6">
              <button onClick={() => setQuery('')} className="flex items-center gap-2 text-status-operating transition-opacity hover:opacity-80">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-status-operating">
                  <span className="material-symbols-outlined text-white text-[17px]" aria-hidden="true">subway</span>
                </div>
                <span className="font-serif font-bold text-[17px] tracking-tight text-text-primary">{tCommon('appName')}</span>
              </button>
              <form role="search" onSubmit={(e) => e.preventDefault()} className="flex-1">
                <SearchInput value={query} onChange={setQuery} compact />
              </form>
              <ThemeToggle />
            </nav>
            <div className="mb-2">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">{t('searchResults')}</p>
              <p className="text-sm text-text-primary/80">{t('resultCount', { query: query.trim(), count: filteredStations.length })}</p>
            </div>
            <div aria-live="polite" className="space-y-2">
              {filteredStations.map((station) => (
                <StationCard key={station.code} station={station} status={data?.stations[station.code]} />
              ))}
              {filteredStations.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
                  <p className="mb-2 font-serif text-base font-bold text-text-primary">{t('noResults', { query: query.trim() })}</p>
                  <p className="text-[13px] text-text-secondary">{t('noResultsHelp')}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Error */}
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

        {/* Loading */}
        {!data && !error && (
          <div role="status" aria-label={tCommon('loading')} className="space-y-6">
            <p className="sr-only">{tCommon('loadingMessage')}</p>
            <SummarySkeleton />
            <AlertsSkeleton />
          </div>
        )}

        {!hasQuery && data && <EnvironmentBanner environment={data.environment} />}
        {!hasQuery && data && (
          <section aria-label={t('summaryLabel')}>
            <StatusSummaryBar summary={data.summary} />
          </section>
        )}

        {/* Fault Stations */}
        {!hasQuery && data && faultStations.length > 0 && (
          <section>
            <div className="mb-2.5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-secondary">⚠ {t('faultStations')}</p>
            </div>
            <ul role="list" className="space-y-1.5">
              {faultStations.slice(0, 8).map((station) => (
                <li key={station.code}>
                  <StationCard station={station} status={data.stations[station.code]} compact />
                </li>
              ))}
              {faultStations.length > 8 && (
                <li className="list-none">
                  <Link href={`/${locale}/faults/`} className="flex items-center justify-center gap-1 pt-2 pb-1 text-xs font-medium text-status-fault hover:text-status-fault/80 transition-colors">
                    {t('viewMoreFaults', { count: faultStations.length - 8 })}
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}

        {/* Line Filter */}
        {!hasQuery && data && (
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="font-serif text-xl font-bold text-text-primary">{t('lineStations')}</h2>
              {selectedLine && <span className="text-xs font-medium text-text-secondary">{t('stationCount', { count: displayStations.length })}</span>}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" role="tablist" aria-label={t('lineFilter')}>
              {LINES.map((line) => (
                <button key={line} role="tab" aria-selected={selectedLine === line} onClick={() => setSelectedLine(selectedLine === line ? null : line)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors min-h-[44px] ${
                    selectedLine === line ? `${LINE_COLORS[line]} text-white` : `bg-surface-elevated border border-border ${LINE_TEXT_COLORS[line]}`
                  }`}
                >
                  {t('lineN', { line })}
                </button>
              ))}
            </div>

            {!selectedLine && (
              <div className="py-6 text-center">
                <span className="text-3xl block mb-2" aria-hidden="true">🚇</span>
                <p className="text-sm text-text-secondary">{t('selectLine')}</p>
              </div>
            )}

            {selectedLine && (
              <>
                <label className="inline-flex items-center gap-2 cursor-pointer self-start">
                  <input type="checkbox" checked={showIssuesOnly} onChange={(e) => setShowIssuesOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-status-fault accent-status-fault" />
                  <span className="text-[13px] text-text-secondary">{t('filterFaults')}</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {displayStations.map((station) => (
                    <StationCard key={station.code} station={station} status={data.stations[station.code]} />
                  ))}
                  {displayStations.length === 0 && (
                    <div className="rounded-xl border border-border bg-bg p-6 text-center">
                      <p className="text-sm text-text-secondary">{showIssuesOnly ? t('noFaults') : t('noStations')}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      {!hasQuery && (
        <footer className="hidden w-full max-w-3xl mx-auto border-t border-border px-8 pb-8 pt-6 text-center md:block">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2">
            <span className="material-symbols-outlined text-sm text-status-operating" aria-hidden="true">cloud_done</span>
            <span className="text-xs font-mono text-text-secondary">{tFooter('source')}</span>
          </div>
          <p className="font-serif text-sm text-text-secondary">{tFooter('tagline')}</p>
          <nav aria-label={tFooter('footerNav')} className="mt-3 flex justify-center gap-4 text-xs text-text-secondary">
            <Link href={`/${locale}/route/`} className="transition-colors hover:text-status-operating">{tFooter('routeGuide')}</Link>
            <Link href={`/${locale}/about/`} className="transition-colors hover:text-status-operating">{tFooter('dataSource')}</Link>
            <Link href={`/${locale}/archive/`} className="transition-colors hover:text-status-operating">{tFooter('archive')}</Link>
            <a href="https://github.com/brody-0125/nadeuri.today" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-status-operating">GitHub</a>
          </nav>
        </footer>
      )}

      <DevSettingsPanel onSettingsChange={loadData} />
    </>
  );
}
