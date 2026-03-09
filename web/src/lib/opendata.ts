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

// Seoul Open Data API station codes → stations.ts canonical codes
// Mirrors the mapping in scripts/build-latest.js
const STATION_CODE_MAP: Record<string, string> = {
  // ── 2호선 (API offset) ──
  '0201': '0151', '0202': '0201', '0204': '0202', '0205': '0204',
  '0206': '0205', '0207': '0206', '0208': '0207', '0209': '0208',
  '0210': '0209', '0211': '0210', '0229': '0230', '0230': '0229',
  '0231': '0233', '0233': '0231', '0234': '0146',
  // ── 3호선 (API offset) ──
  '0309': '0301', '0310': '0302', '0311': '0306', '0312': '0307',
  '0313': '0303', '0314': '0304', '0315': '0305', '0316': '0308',
  '0317': '0309', '0318': '0310', '0319': '0153', '0320': '0203',
  '0322': '0312', '0323': '0313', '0324': '0314', '0325': '0315',
  '0326': '0316', '0327': '0317', '0328': '0318', '0329': '0319',
  '0330': '0223', '0331': '0332', '0332': '0320', '0333': '0321',
  '0334': '0322', '0335': '0323', '0336': '0324', '0337': '0325',
  '0338': '0326', '0339': '0327', '0340': '0328', '0341': '0329',
  '0342': '0330',
  // ── 4호선 (API offset) ──
  '0409': '0401', '0410': '0402', '0411': '0409', '0412': '0166',
  '0413': '0410', '0414': '0411', '0415': '0412', '0416': '0413',
  '0417': '0414', '0418': '0415', '0419': '0416', '0420': '0417',
  '0421': '0155', '0422': '0204', '0423': '0331', '0424': '0419',
  '0425': '0420', '0426': '0150', '0427': '0421', '0428': '0422',
  '0429': '0438', '0430': '0423', '0431': '0424', '0432': '0425',
  '0433': '0226', '0434': '0427',
  // ── 5호선 (25xx → 05xx) ──
  '2511': '0510', '2512': '0511', '2513': '0512', '2514': '0513',
  '2515': '0514', '2516': '0515', '2517': '0516', '2518': '0517',
  '2519': '0518', '2520': '0519', '2521': '0520', '2522': '0521',
  '2523': '0522', '2524': '0236', '2525': '0524', '2526': '0144',
  '2527': '0527', '2528': '0526', '2529': '0528', '2530': '0529',
  '2531': '0530', '2532': '0243', '2533': '0534', '2534': '0533',
  '2535': '0153', '2536': '0202', '2537': '0204', '2539': '0537',
  '2540': '0538', '2541': '0207', '2542': '0539', '2543': '0540',
  '2544': '0541', '2545': '0542', '2546': '0543', '2547': '0544',
  '2548': '0545', '2549': '0546', '2550': '0547', '2551': '0548',
  '2552': '0549', '2553': '0550', '2554': '0551', '2555': '0557',
  '2556': '0936', '2557': '0558', '2558': '0330', '2559': '0559',
  '2560': '0560', '2561': '0561', '2562': '0552', '2563': '0553',
  '2564': '0554', '2565': '0555', '2566': '0556',
  // ── 6호선 (26xx → 06xx) ──
  '2611': '0610', '2612': '0611', '2613': '0307', '2614': '0632',
  '2615': '0306', '2616': '0633', '2617': '0614', '2618': '0613',
  '2619': '0612', '2620': '0634', '2621': '0615', '2622': '0616',
  '2623': '0238', '2624': '0635', '2625': '0617', '2626': '0618',
  '2627': '0529', '2628': '0619', '2629': '0422', '2630': '0620',
  '2631': '0621', '2632': '0622', '2633': '0623', '2634': '0313',
  '2635': '0536', '2636': '0205', '2637': '0624', '2638': '0636',
  '2639': '0637', '2640': '0638', '2641': '0639', '2642': '0640',
  '2643': '0625', '2644': '0626', '2645': '0162', '2646': '0628',
  '2647': '0629', '2648': '0630', '2649': '0631',
  // ── 7호선 (27xx → 07xx) ──
  '2711': '0709', '2712': '0169', '2713': '0711', '2714': '0712',
  '2715': '0409', '2716': '0714', '2717': '0715', '2718': '0716',
  '2719': '0628', '2720': '0717', '2721': '0723', '2722': '0718',
  '2723': '0719', '2724': '0720', '2725': '0721', '2726': '0722',
  '2727': '0542', '2728': '0724', '2729': '0212', '2730': '0747',
  '2731': '0726', '2732': '0727', '2733': '0728', '2734': '0729',
  '2735': '0730', '2736': '0319', '2737': '0731', '2738': '0732',
  '2739': '0733', '2740': '0734', '2741': '0735', '2742': '0736',
  '2743': '0234', '2744': '0738', '2745': '0739', '2746': '0231',
  '2747': '0741', '2748': '0742', '2749': '0743', '2750': '0744',
  '2751': '0745', '2752': '0746',
  // ── 8호선 (28xx → 08xx) ──
  '2810': '0809', '2811': '0810', '2812': '0545', '2813': '0812',
  '2814': '0813', '2815': '0216', '2816': '0815', '2817': '0816',
  '2818': '0328', '2819': '0818', '2820': '0819', '2821': '0820',
  '2822': '0821', '2823': '0822', '2824': '0823', '2825': '0824',
  '2826': '0825', '2827': '0826', '2828': '0827',
  // ── 1호선/6호선 ──
  '0159': '0624',
};

function normalizeStationCode(apiCode: string): string {
  return STATION_CODE_MAP[apiCode] || apiCode;
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

    const station = stationsMap.get(normalizeStationCode(row.STN_CD));
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
