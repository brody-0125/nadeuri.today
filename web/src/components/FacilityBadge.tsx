import { FacilityStatus } from '@/types';

interface FacilityBadgeProps {
  status: FacilityStatus;
  label: string;
}

const STATUS_CONFIG: Record<FacilityStatus, { bg: string; border: string; dot: string; text: string; pulse?: boolean }> = {
  OPERATING: {
    bg: 'bg-status-operating-bg',
    border: 'border-status-operating-border',
    dot: 'bg-status-operating',
    text: 'text-status-operating',
  },
  FAULT: {
    bg: 'bg-status-fault-bg',
    border: 'border-status-fault-border',
    dot: 'bg-status-fault',
    text: 'text-status-fault',
    pulse: true,
  },
  MAINTENANCE: {
    bg: 'bg-status-maintenance-bg',
    border: 'border-status-maintenance-border',
    dot: 'bg-status-maintenance',
    text: 'text-status-maintenance',
  },
  UNKNOWN: {
    bg: 'bg-status-unknown-bg',
    border: 'border-status-unknown-border',
    dot: 'bg-status-unknown',
    text: 'text-status-unknown',
  },
};

const STATUS_ARIA: Record<FacilityStatus, string> = {
  OPERATING: '정상',
  FAULT: '고장',
  MAINTENANCE: '점검 중',
  UNKNOWN: '확인불가',
};

const STATUS_ICONS: Record<FacilityStatus, string> = {
  OPERATING: 'check_circle',
  FAULT: 'warning',
  MAINTENANCE: 'build',
  UNKNOWN: 'remove',
};

export default function FacilityBadge({ status, label }: FacilityBadgeProps) {
  const c = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 min-w-[48px] justify-center ${c.bg} ${c.border}`}
      aria-label={`${label}: ${STATUS_ARIA[status]}`}
    >
      <span
        className={`material-symbols-outlined text-sm ${c.text}`}
        aria-hidden="true"
      >
        {STATUS_ICONS[status]}
      </span>
      <span className={`font-mono text-sm font-medium ${c.text}`}>{label}</span>
    </span>
  );
}
