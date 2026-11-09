// Two 90-minute collection intervals allow for a delayed scheduled run.
// Keep this policy aligned with web/src/lib/freshness.ts.
export const STALE_AFTER_MS = 180 * 60 * 1000;
const REQUIRED_TYPES = ['elevator', 'escalator', 'wheelchair-lift'];

export function collectionFreshness(realtimeData, now = Date.now()) {
  const collected_at_by_type = {};
  for (const type of new Set([...REQUIRED_TYPES, ...Object.keys(realtimeData)])) {
    const source = realtimeData[type];
    // Unsupported optional APIs have no facilities and should not block freshness.
    if (!REQUIRED_TYPES.includes(type) && !source?.facilities?.length) continue;
    const raw = source?.collected_at;
    const parsed = raw ? Date.parse(raw) : NaN;
    collected_at_by_type[type] = Number.isFinite(parsed) && parsed <= now
      ? new Date(parsed).toISOString() : null;
  }
  const times = Object.values(collected_at_by_type).filter(Boolean).map(Date.parse);
  const oldest = times.length ? Math.min(...times) : null;
  return {
    // Never substitute aggregation time for unknown collection time.
    updated_at: oldest === null ? null : new Date(oldest).toISOString(),
    collected_at_by_type,
    data_age_minutes: oldest === null ? 0 : Math.floor((now - oldest) / 60_000),
    is_stale: oldest === null || Object.values(collected_at_by_type).some((time) => time === null)
      || now - oldest > STALE_AFTER_MS,
  };
}
