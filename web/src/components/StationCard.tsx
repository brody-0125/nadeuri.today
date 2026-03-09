import Link from 'next/link';
import { StationMeta, StationStatus, FacilityType } from '@/types';

interface StationCardProps {
  station: StationMeta;
  status?: StationStatus;
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

export default function StationCard({ station, status }: StationCardProps) {
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
        className={`flex flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-5 transition-all hover:border-border-strong hover:shadow-paper sm:flex-row sm:items-center ${
          faultCount > 0 ? 'border-l-[4px] border-l-status-fault-border' : maintCount > 0 ? 'border-l-[4px] border-l-status-maintenance-border' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Line Badge */}
          <div className="flex-shrink-0 mt-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold text-white shadow-sm ${LINE_COLORS[station.lines[0]] ?? 'bg-status-unknown'}`}
              aria-label={`${station.lines[0]}호선`}
            >
              {station.lines[0]}
            </div>
          </div>
          {/* Info */}
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary transition-colors group-hover:text-status-operating">
              {station.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              {station.lines.map((line) => (
                <span
                  key={line}
                  className="inline-flex items-center rounded border border-border bg-bg px-2 py-0.5 text-xs font-medium text-text-secondary"
                >
                  {line}호선
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status Pill + Actions */}
        <div className="flex flex-col items-start sm:items-end gap-2">
          {status ? (
            hasIssue ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-status-fault-border bg-status-fault-bg px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-status-fault" />
                <span className="font-mono text-sm font-medium text-status-fault">
                  {faultCount > 0 ? `${faultCount}개 고장` : `${maintCount}개 점검 중`}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-status-operating-border bg-status-operating-bg px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-status-operating" />
                <span className="font-mono text-sm font-medium text-status-operating">전체 정상</span>
              </div>
            )
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-status-unknown-border bg-status-unknown-bg px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-status-unknown" />
              <span className="font-mono text-sm font-medium text-status-unknown">정보 없음</span>
            </div>
          )}

          <div className="flex gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1 transition-colors group-hover:text-status-operating">
              상세 보기
              <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
