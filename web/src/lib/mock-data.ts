import { LatestData, FacilityStatus } from '@/types';
import { STATIONS } from './stations';

function randomStatus(): FacilityStatus {
  const r = Math.random();
  if (r < 0.85) return 'OPERATING';
  if (r < 0.92) return 'FAULT';
  if (r < 0.97) return 'MAINTENANCE';
  return 'UNKNOWN';
}

function makeFacilities(prefix: string, count: number) {
  const floors = ['B4', 'B3', 'B2', 'B1', '1F', '2F'];
  return Array.from({ length: count }, (_, i) => {
    const from = floors[Math.floor(Math.random() * (floors.length - 1))];
    const toIdx = floors.indexOf(from) + 1;
    return {
      facility_id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
      location_detail: `${Math.floor(Math.random() * 8) + 1}번 출구 부근`,
      floor_from: from,
      floor_to: floors[toIdx] ?? '1F',
      status: randomStatus(),
      status_code: '01',
    };
  });
}

export function generateMockData(): LatestData {
  const stations: LatestData['stations'] = {};
  let totalElev = 0, opElev = 0, faultElev = 0;
  let totalEsc = 0, opEsc = 0, faultEsc = 0;

  for (const s of STATIONS) {
    const elevators = makeFacilities('EV', Math.floor(Math.random() * 4) + 2);
    const escalators = makeFacilities('ES', Math.floor(Math.random() * 6) + 3);

    totalElev += elevators.length;
    opElev += elevators.filter(f => f.status === 'OPERATING').length;
    faultElev += elevators.filter(f => f.status === 'FAULT').length;
    totalEsc += escalators.length;
    opEsc += escalators.filter(f => f.status === 'OPERATING').length;
    faultEsc += escalators.filter(f => f.status === 'FAULT').length;

    stations[s.code] = {
      name: s.name,
      lines: s.lines,
      lat: s.lat,
      lng: s.lng,
      facilities: {
        elevator: elevators,
        escalator: escalators,
      },
      disabled_restroom: Math.random() > 0.3 ? [{ id: 'DR-001', location: '대합실' }] : [],
      wheelchair_charger: Math.random() > 0.6 ? [{ id: 'WC-001', location: '역무실 앞' }] : [],
      sign_language_phone: Math.random() > 0.7 ? [{ id: 'SL-001', location: '고객안내센터' }] : [],
      helper: Math.random() > 0.5 ? [{ id: 'HP-001', location: '역무실' }] : [],
    };
  }

  return {
    updated_at: new Date().toISOString(),
    data_age_minutes: 2,
    is_stale: false,
    summary: {
      elevator: { total: totalElev, operating: opElev, fault: faultElev },
      escalator: { total: totalEsc, operating: opEsc, fault: faultEsc },
    },
    stations,
  };
}
