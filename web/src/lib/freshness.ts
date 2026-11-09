import type { LatestData } from '@/types';

// Two 90-minute collection intervals allow for a delayed scheduled run.
export const STALE_AFTER_MS = 180 * 60 * 1000;
export const FRESHNESS_REFRESH_MS = 30_000;

type FreshnessSource = Pick<LatestData, 'updated_at' | 'is_stale' | 'collected_at_by_type' | 'summary'>;

/** Recalculate from collection time, never from fetch/cache/build time. */
export function getDataFreshness(data: FreshnessSource, now = Date.now()) {
  const timestamps = data.collected_at_by_type
    ? [...new Set([
      ...Object.keys(data.collected_at_by_type),
      ...Object.entries(data.summary).filter(([, counts]) => counts.total > 0).map(([type]) => type),
    ])].map((type) => data.collected_at_by_type![type])
    : [data.updated_at];
  const parsed = timestamps.map((value) => value ? Date.parse(value) : NaN);
  const hasUnknownTime = parsed.length === 0 || parsed.some((time) => !Number.isFinite(time) || time > now);
  const validTimes = parsed.filter((time) => Number.isFinite(time) && time <= now);
  const collectedAt = validTimes.length ? Math.min(...validTimes) : null;
  const ageMs = collectedAt === null ? null : now - collectedAt;
  return {
    collectedAt,
    ageMinutes: ageMs === null ? null : Math.floor(ageMs / 60_000),
    isStale: data.is_stale || hasUnknownTime || ageMs === null || ageMs > STALE_AFTER_MS,
    hasUnknownTime,
  };
}

export function withCurrentFreshness(data: LatestData, now = Date.now()): LatestData {
  const freshness = getDataFreshness(data, now);
  return {
    ...data,
    is_stale: freshness.isStale,
    data_age_minutes: freshness.ageMinutes ?? data.data_age_minutes,
  };
}
