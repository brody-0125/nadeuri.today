'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { LatestData, FacilityType } from '@/types';
import { fetchLatest } from '@/lib/data';
import { STATIONS, LINES } from '@/lib/stations';
import StationCard from '@/components/StationCard';
import ThemeToggle from '@/components/ThemeToggle';
import DataFreshnessBar from '@/components/DataFreshnessBar';

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
  const [data, setData] = useState<LatestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  useEffect(() => {
    fetchLatest()
      .then(setData)
      .catch(() => setError('데이터를 불러오지 못했습니다. 잠시 후 새로고침 해보세요.'));
  }, []);

  const faultStations = useMemo(() => {
    if (!data) return [];
    return STATIONS.filter((s) => hasFaultStation(data, s.code))
      .sort((a, b) => countFaults(data, b.code) - countFaults(data, a.code));
  }, [data]);

  const filteredStations = useMemo(() => {
    if (!selectedLine) return faultStations;
    return faultStations.filter((s) => s.lines.includes(selectedLine));
  }, [faultStations, selectedLine]);

  // Count fault stations per line for badge display
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

      {/* Navbar — consistent with about page */}
      <nav className="bg-surface border-b border-border" aria-label="상단 탐색">
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-status-operating hover:opacity-80 transition-opacity">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-status-operating">
              <span className="material-symbols-outlined text-white text-[16px]" aria-hidden="true">subway</span>
            </div>
            <span className="font-serif font-bold text-[17px] text-text-primary tracking-tight">나들이</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm text-text-secondary hover:text-status-operating transition-colors flex items-center gap-1">
              홈으로
              <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-8 py-6 flex flex-col gap-5">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-xl font-bold text-text-primary mb-1">
            ⚠ 현재 고장 역
          </h1>
          <p className="text-[13px] text-text-secondary">
            {data ? (
              <>현재 고장·점검 중인 시설이 있는 역 <span className="font-mono font-medium text-status-fault">{faultStations.length}</span>개</>
            ) : (
              '데이터를 불러오는 중...'
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-status-fault-border bg-status-fault-bg p-4 text-sm text-status-fault" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading */}
        {!data && !error && (
          <div role="status" aria-label="데이터 로딩 중" className="space-y-3">
            <p className="sr-only">역 정보를 가져오고 있어요...</p>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {/* Line Filter */}
        {data && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" role="tablist" aria-label="호선 필터">
              <button
                role="tab"
                aria-selected={selectedLine === null}
                onClick={() => setSelectedLine(null)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors min-h-[44px] ${
                  selectedLine === null
                    ? 'bg-status-fault text-white'
                    : 'bg-surface-elevated border border-border text-text-secondary'
                }`}
              >
                전체
              </button>
              {LINES.map((line) => (
                <button
                  key={line}
                  role="tab"
                  aria-selected={selectedLine === line}
                  onClick={() => setSelectedLine(selectedLine === line ? null : line)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors min-h-[44px] ${
                    selectedLine === line
                      ? `${LINE_COLORS[line]} text-white`
                      : `bg-surface-elevated border border-border ${LINE_TEXT_COLORS[line]}`
                  }`}
                >
                  {line}호선
                  {lineCounts[line] > 0 && (
                    <span className={`ml-1 ${selectedLine === line ? 'text-white/80' : 'text-text-secondary'}`}>
                      {lineCounts[line]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Station List */}
            <div className="space-y-2">
              {filteredStations.map((station) => (
                <StationCard
                  key={station.code}
                  station={station}
                  status={data.stations[station.code]}
                  compact
                />
              ))}
              {filteredStations.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-3" aria-hidden="true">✅</p>
                  <p className="font-serif text-base font-bold text-text-primary mb-1">
                    {selectedLine ? `${selectedLine}호선에 고장 역이 없어요` : '현재 고장 역이 없어요'}
                  </p>
                  <p className="text-[13px] text-text-secondary">
                    모든 시설이 정상 운행 중입니다
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
