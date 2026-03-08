import { LatestData, FacilitySummary, FacilityStatus, FacilityType, StationStatus } from '@/types';
import { STATIONS } from './stations';

/**
 * 서울 열린데이터 광장 — SeoulMetroFaciInfo API
 * @see https://data.seoul.go.kr/dataList/OA-15994/S/1/datasetView.do
 *
 * 엔드포인트: http://openapi.seoul.go.kr:8088/{KEY}/json/SeoulMetroFaciInfo/{start}/{end}/
 * 총 약 2,800건 → 1~1000, 1001~2000, 2001~3000 세 번에 나누어 호출
 */

// NOTE: 서울 열린데이터 API는 HTTPS 미지원 (포트 8088, SSL 없음)
const BASE_URL = 'http://openapi.seoul.go.kr:8088';
const SERVICE = 'SeoulMetroFaciInfo';
const PAGE_SIZE = 1000;

interface ApiRow {
  STN_CD: string;      // 역코드 (0150 등)
  STN_NM: string;      // 역명 (서울역(1) 형태)
  ELVTR_SE: string;    // 승강기 구분: EV=엘리베이터, ES=에스컬레이터, WL=휠체어리프트
  ELVTR_NM: string;    // 승강기명
  OPR_SEC: string;     // 운행구간 (B1-1F 등)
  INSTL_PSTN: string;  // 설치위치
  USE_YN: string;      // 운행상태: "사용가능", "보수중", "사용불가" 등
}

interface ApiResponse {
  [key: string]: {
    list_total_count: number;
    RESULT: { CODE: string; MESSAGE: string };
    row: ApiRow[];
  };
}

const SE_TO_TYPE: Record<string, FacilityType> = {
  EV: 'elevator',
  ES: 'escalator',
  WL: 'wheelchair_lift',
};

function mapUseYnToStatus(useYn: string): FacilityStatus {
  if (useYn === '사용가능') return 'OPERATING';
  if (useYn === '보수중' || useYn === '점검중') return 'MAINTENANCE';
  if (useYn === '사용불가' || useYn === '고장') return 'FAULT';
  return 'UNKNOWN';
}

function parseFloors(oprSec: string): { from?: string; to?: string } {
  const parts = oprSec.split('-');
  if (parts.length === 2) {
    return { from: parts[0].trim(), to: parts[1].trim() };
  }
  return {};
}

function extractFacilityId(row: ApiRow): string {
  // ELVTR_NM 에서 호기 번호를 추출: "... 4호기" → "4", "#1" → "1"
  const hoMatch = row.ELVTR_NM.match(/(\d+)호기/);
  if (hoMatch) {
    const prefix = SE_TO_TYPE[row.ELVTR_SE] === 'elevator' ? 'EV' : SE_TO_TYPE[row.ELVTR_SE] === 'escalator' ? 'ES' : 'WL';
    return `${prefix}-${row.STN_CD}-${hoMatch[1]}`;
  }
  const hashMatch = row.ELVTR_NM.match(/#(\d+)/);
  if (hashMatch) {
    const prefix = SE_TO_TYPE[row.ELVTR_SE] === 'elevator' ? 'EV' : 'WL';
    return `${prefix}-${row.STN_CD}-${hashMatch[1]}`;
  }
  // fallback: 역코드 + 승강기명 해시
  return `${row.ELVTR_SE}-${row.STN_CD}-${row.ELVTR_NM.slice(-10)}`;
}

async function fetchPage(apiKey: string, start: number, end: number): Promise<{ rows: ApiRow[]; total: number }> {
  const url = `${BASE_URL}/${encodeURIComponent(apiKey)}/json/${SERVICE}/${start}/${end}/`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('API 인증키가 유효하지 않습니다. 키를 확인해주세요.');
    }
    throw new Error(`열린데이터 API 오류 (HTTP ${res.status})`);
  }

  const json: ApiResponse = await res.json();
  const body = json[SERVICE];

  if (!body) {
    throw new Error(`API 응답에 ${SERVICE} 데이터가 없습니다.`);
  }

  if (body.RESULT.CODE === 'ERROR-337') {
    throw new Error('API 인증키가 유효하지 않습니다. 키를 확인해주세요.');
  }

  if (body.RESULT.CODE !== 'INFO-000') {
    throw new Error(`API 오류: ${body.RESULT.MESSAGE} (${body.RESULT.CODE})`);
  }

  return { rows: body.row ?? [], total: body.list_total_count };
}

export async function fetchFromOpenData(apiKey: string): Promise<LatestData> {
  // 1차 호출: 1~1000 + 총 건수 확인
  const first = await fetchPage(apiKey, 1, PAGE_SIZE);
  let allRows = first.rows;

  // 추가 페이지 호출 (필요 시)
  if (first.total > PAGE_SIZE) {
    const remaining: Promise<{ rows: ApiRow[]; total: number }>[] = [];
    for (let start = PAGE_SIZE + 1; start <= first.total; start += PAGE_SIZE) {
      const end = Math.min(start + PAGE_SIZE - 1, first.total);
      remaining.push(fetchPage(apiKey, start, end));
    }
    const pages = await Promise.all(remaining);
    for (const page of pages) {
      allRows = allRows.concat(page.rows);
    }
  }

  // 역 코드 → StationStatus 매핑
  const stationsMap = new Map<string, StationStatus>();

  // 모든 역 초기화
  for (const s of STATIONS) {
    stationsMap.set(s.code, {
      name: s.name,
      lines: s.lines,
      lat: s.lat,
      lng: s.lng,
      facilities: {},
    });
  }

  // API 데이터 매핑
  for (const row of allRows) {
    const facilityType = SE_TO_TYPE[row.ELVTR_SE];
    if (!facilityType) continue;

    const station = stationsMap.get(row.STN_CD);
    if (!station) continue; // 우리 목록에 없는 역은 무시

    if (!station.facilities[facilityType]) {
      station.facilities[facilityType] = [];
    }

    const floors = parseFloors(row.OPR_SEC);
    const facility: FacilitySummary = {
      facility_id: extractFacilityId(row),
      location_detail: row.INSTL_PSTN,
      floor_from: floors.from,
      floor_to: floors.to,
      status: mapUseYnToStatus(row.USE_YN),
      status_code: row.USE_YN,
    };

    station.facilities[facilityType]!.push(facility);
  }

  // Summary 계산
  const TYPES: FacilityType[] = ['elevator', 'escalator', 'wheelchair_lift'];
  const summary: LatestData['summary'] = {};
  for (const type of TYPES) {
    let total = 0, operating = 0, fault = 0;
    for (const station of stationsMap.values()) {
      const list = station.facilities[type];
      if (!list) continue;
      total += list.length;
      operating += list.filter((f) => f.status === 'OPERATING').length;
      fault += list.filter((f) => f.status === 'FAULT').length;
    }
    if (total > 0) {
      summary[type] = { total, operating, fault };
    }
  }

  const stations: Record<string, StationStatus> = {};
  for (const [code, status] of stationsMap) {
    stations[code] = status;
  }

  return {
    updated_at: new Date().toISOString(),
    data_age_minutes: 0,
    is_stale: false,
    summary,
    stations,
  };
}
