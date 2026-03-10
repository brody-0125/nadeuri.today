import Link from 'next/link';
import { StationMeta, StationStatus, FacilityType } from '@/types';

interface StationCardProps {
  station: StationMeta;
  status?: StationStatus;
  compact?: boolean;
}

const LINE_COLORS: Record<string, string> = {
  '1': 'bg-line-1',
  '2': 'bg-line-2',
  '3': 'bg-line-3',
  '4': 'bg-line-4',
  '5': 'bg-line-5',
  '6': 'bg-line-6',
  '7': 'bg-line-7',
  '8': 'bg-line-8',
  '9': 'bg-line-9',
};

const FACILITY_TYPES: FacilityType[] = [
  'elevator',
  'escalator',
  'moving_walk',
  'wheelchair_lift',
  'safety_board',
];

export default function StationCard({ station, status, compact = false }: StationCardProps) {
  const faultCount = status
    ? FACILITY_TYPES.reduce(
        (acc, type) =>
          acc + (status.facilities[type]?.filter((f) => f.status === 'FAULT').length ?? 0),
        0
      )
    : 0;

  const maintCount = status
    ? FACILITY_TYPES.reduce(
        (acc, type) =>
          acc + (status.facilities[type]?.filter((f) => f.status === 'MAINTENANCE').length ?? 0),
        0
      )
    : 0;

  const hasIssue = faultCount > 0 || maintCount > 0;

  return (
    <Link
      href={`/station/${station.code}/`}
      className="block group"
    >
      <article
        aria-label={`${station.name} ${station.lines.join('·')}호선, ${hasIssue ? (faultCount > 0 ? `${faultCount}개 고장` : `${maintCount}개 점검 중`) : '전체 정상'}`}
        className={`flex items-center justify-between rounded-lg border border-border bg-surface transition-all hover:border-border-strong hover:shadow-paper ${
          compact ? 'gap-3 px-4 py-3' : 'gap-4 p-5'
        } ${
          faultCount > 0 ? 'border-l-[4px] border-l-status-fault-border' : maintCount > 0 ? 'border-l-[4px] border-l-status-maintenance-border' : ''
        }`}
      >
        <div className={`flex min-w-0 items-center ${compact ? 'gap-3' : 'items-start gap-4'}`}>
          {/* Line Badge */}
          <div className="flex-shrink-0">
            <div
              className={`flex items-center justify-center rounded-full font-mono font-bold text-white shadow-sm ${
                compact ? 'h-7 w-7 text-xs' : 'h-10 w-10 text-sm mt-1'
              } ${LINE_COLORS[station.lines[0]] ?? 'bg-status-unknown'}`}
              aria-label={`${station.lines[0]}호선`}
            >
              {station.lines[0]}
            </div>
          </div>
          {/* Info */}
          <div className="min-w-0">
            <h3 className={`font-serif font-bold text-text-primary transition-colors group-hover:text-status-operating ${
              compact ? 'text-[15px]' : 'text-xl'
            }`}>
              {station.name}
            </h3>
            {!compact && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {station.lines.map((line) => (
                  <span
                    key={line}
                    className="inline-flex items-center rounded border border-border bg-bg px-2 py-0.5 text-xs font-medium text-text-secondary"
                  >
                    {line}호선
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Pill + Actions */}
        <div className={`flex-shrink-0 flex items-center gap-2 ${compact ? '' : 'flex-col items-end gap-2'}`}>
          {status ? (
            hasIssue ? (
              <div className={`inline-flex items-center gap-1.5 rounded-full border border-status-fault-border bg-status-fault-bg ${
                compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
              }`}>
                <span className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} animate-pulse rounded-full bg-status-fault`} />
                <span className={`font-mono font-medium text-status-fault ${compact ? 'text-xs' : 'text-sm'}`}>
                  {faultCount > 0 ? `${faultCount}개 고장` : `${maintCount}개 점검 중`}
                </span>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-1.5 rounded-full border border-status-operating-border bg-status-operating-bg ${
                compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
              }`}>
                <span className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full bg-status-operating`} />
                <span className={`font-mono font-medium text-status-operating ${compact ? 'text-xs' : 'text-sm'}`}>전체 정상</span>
              </div>
            )
          ) : (
            <div className={`inline-flex items-center gap-1.5 rounded-full border border-status-unknown-border bg-status-unknown-bg ${
              compact ? 'px-2.5 py-1' : 'px-3 py-1.5'
            }`}>
              <span className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full bg-status-unknown`} />
              <span className={`font-mono font-medium text-status-unknown ${compact ? 'text-xs' : 'text-sm'}`}>정보 없음</span>
            </div>
          )}

          {!compact && (
            <div className="flex gap-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1 transition-colors group-hover:text-status-operating">
                상세 보기
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
