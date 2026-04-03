'use client';

import { useTranslations } from 'next-intl';
import { FacilityType, FacilityTypeSummary } from '@/types';

interface StatusSummaryBarProps {
  summary: Partial<Record<FacilityType, FacilityTypeSummary>>;
  totalStations?: number;
  faultStationCount?: number;
}

export default function StatusSummaryBar({ summary }: StatusSummaryBarProps) {
  const t = useTranslations('statusSummary');

  const elev = summary.elevator;
  const esc = summary.escalator;
  const elevRate = elev && elev.total > 0
    ? ((elev.operating / elev.total) * 100).toFixed(1)
    : null;
  const escRate = esc && esc.total > 0
    ? ((esc.operating / esc.total) * 100).toFixed(1)
    : null;

  const totalFaults = Object.values(summary).reduce(
    (acc, s) => acc + (s?.fault ?? 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* System Health */}
      <div className={`flex h-32 flex-col justify-between rounded-lg border bg-surface p-5 transition-colors ${
        totalFaults > 0 ? 'border-status-fault/30 hover:border-status-fault/50' : 'border-border hover:border-status-operating/30'
      }`}>
        <div className="flex justify-between items-start">
          <span className="text-sm font-sans font-medium text-text-secondary">{t('systemHealth')}</span>
          {totalFaults > 0 ? (
            <span className="material-symbols-outlined text-xl text-status-fault" aria-hidden="true">warning</span>
          ) : (
            <span className="material-symbols-outlined text-xl text-status-operating" aria-hidden="true">check_circle</span>
          )}
        </div>
        <span className={`font-serif text-2xl font-bold ${totalFaults > 0 ? 'text-status-fault' : 'text-text-primary'}`}>
          {totalFaults > 0 ? t('caution') : t('healthy')}
        </span>
      </div>

      {/* Elevator Rate */}
      <div className="flex h-32 flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-status-operating/30">
        <div className="flex justify-between items-start">
          <span className="text-sm font-sans font-medium text-text-secondary whitespace-pre-line">{t('elevatorRate')}</span>
          <span className="material-symbols-outlined text-xl text-text-secondary" aria-hidden="true">elevator</span>
        </div>
        <span className="font-mono text-3xl font-medium text-text-primary">
          {elevRate ? `${elevRate}%` : '—'}
        </span>
      </div>

      {/* Escalator Rate */}
      <div className="flex h-32 flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-status-operating/30">
        <div className="flex justify-between items-start">
          <span className="text-sm font-sans font-medium text-text-secondary whitespace-pre-line">{t('escalatorRate')}</span>
          <span className="material-symbols-outlined text-xl text-text-secondary" aria-hidden="true">escalator</span>
        </div>
        <span className="font-mono text-3xl font-medium text-text-primary">
          {escRate ? `${escRate}%` : '—'}
        </span>
      </div>

      {/* Alerts */}
      <div className={`flex h-32 flex-col justify-between rounded-lg border bg-surface p-5 transition-colors ${
        totalFaults > 0
          ? 'border-status-fault/30 hover:border-status-fault/50'
          : 'border-border hover:border-status-operating/30'
      }`}>
        <div className="flex justify-between items-start">
          <span className="text-sm font-sans font-medium text-text-secondary">{t('realtimeAlerts')}</span>
          {totalFaults > 0 ? (
            <span className="material-symbols-outlined text-xl text-status-fault" aria-hidden="true">warning</span>
          ) : (
            <span className="material-symbols-outlined text-xl text-status-operating" aria-hidden="true">verified</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-2xl font-bold text-text-primary">
            {totalFaults > 0 ? t('alertCount', { count: totalFaults }) : t('noAlerts')}
          </span>
          {totalFaults > 0 && (
            <span className="mt-1 font-mono text-xs font-medium text-status-fault">{t('faultInProgress')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
