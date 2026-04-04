import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import { loadJSON, saveJSON } from "./lib/json-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REALTIME_TYPES = [
  "elevator",
  "escalator",
  "moving-walk",
  "wheelchair-lift",
  "safety-board",
];

const STATIC_TYPES = [
  "disabled-restroom",
  "sign-language-phone",
  "wheelchair-charger",
  "helper",
];

// Seoul Open Data API station codes → stations.ts canonical codes
// The API uses different numbering for lines 2-4 and entirely different
// prefixes (25xx/26xx/27xx/28xx) for lines 5-8.
const STATION_CODE_MAP = {
  // ── 2호선 (API offset) ──
  '0201': '0151', // 시청
  '0202': '0201', // 을지로입구
  '0204': '0202', // 을지로4가
  '0205': '0204', // 동대문역사문화공원
  '0206': '0205', // 신당
  '0207': '0206', // 상왕십리
  '0208': '0207', // 왕십리
  '0209': '0208', // 한양대
  '0210': '0209', // 뚝섬
  '0211': '0210', // 성수
  '0229': '0230', // 봉천
  '0230': '0229', // 신림
  '0231': '0233', // 신대방
  '0233': '0231', // 대림
  '0234': '0146', // 신도림
  // ── 3호선 (API offset) ──
  '0309': '0301', // 지축
  '0310': '0302', // 구파발
  '0311': '0306', // 연신내
  '0312': '0307', // 불광
  '0313': '0303', // 녹번
  '0314': '0304', // 홍제
  '0315': '0305', // 무악재
  '0316': '0308', // 독립문
  '0317': '0309', // 경복궁
  '0318': '0310', // 안국
  '0319': '0153', // 종로3가
  '0320': '0203', // 을지로3가
  '0322': '0312', // 동대입구
  '0323': '0313', // 약수
  '0324': '0314', // 금호
  '0325': '0315', // 옥수
  '0326': '0316', // 압구정
  '0327': '0317', // 신사
  '0328': '0318', // 잠원
  '0329': '0319', // 고속터미널
  '0330': '0223', // 교대
  '0331': '0332', // 남부터미널
  '0332': '0320', // 양재
  '0333': '0321', // 매봉
  '0334': '0322', // 도곡
  '0335': '0323', // 대치
  '0336': '0324', // 학여울
  '0337': '0325', // 대청
  '0338': '0326', // 일원
  '0339': '0327', // 수서
  '0340': '0328', // 가락시장
  '0341': '0329', // 경찰병원
  '0342': '0330', // 오금
  // ── 4호선 (API offset) ──
  '0409': '0401', // 불암산
  '0410': '0402', // 상계
  '0411': '0409', // 노원
  '0412': '0166', // 창동
  '0413': '0410', // 쌍문
  '0414': '0411', // 수유
  '0415': '0412', // 미아
  '0416': '0413', // 미아사거리
  '0417': '0414', // 길음
  '0418': '0415', // 성신여대입구
  '0419': '0416', // 한성대입구
  '0420': '0417', // 혜화
  '0421': '0155', // 동대문
  '0422': '0204', // 동대문역사문화공원
  '0423': '0331', // 충무로
  '0424': '0419', // 명동
  '0425': '0420', // 회현
  '0426': '0150', // 서울역
  '0427': '0421', // 숙대입구
  '0428': '0422', // 삼각지
  '0429': '0438', // 신용산
  '0430': '0423', // 이촌
  '0431': '0424', // 동작
  '0432': '0425', // 총신대입구
  '0433': '0226', // 사당
  '0434': '0427', // 남태령
  // ── 5호선 (25xx → 05xx) ──
  '2511': '0510', // 방화
  '2512': '0511', // 개화산
  '2513': '0512', // 김포공항
  '2514': '0513', // 송정
  '2515': '0514', // 마곡
  '2516': '0515', // 발산
  '2517': '0516', // 우장산
  '2518': '0517', // 화곡
  '2519': '0518', // 까치산
  '2520': '0519', // 신정
  '2521': '0520', // 목동
  '2522': '0521', // 오목교
  '2523': '0522', // 양평
  '2524': '0236', // 영등포구청
  '2525': '0524', // 영등포시장
  '2526': '0144', // 신길
  '2527': '0527', // 여의도
  '2528': '0526', // 여의나루
  '2529': '0528', // 마포
  '2530': '0529', // 공덕
  '2531': '0530', // 애오개
  '2532': '0243', // 충정로
  '2533': '0534', // 서대문
  '2534': '0533', // 광화문
  '2535': '0153', // 종로3가
  '2536': '0202', // 을지로4가
  '2537': '0204', // 동대문역사문화공원
  '2539': '0537', // 신금호
  '2540': '0538', // 행당
  '2541': '0207', // 왕십리
  '2542': '0539', // 마장
  '2543': '0540', // 답십리
  '2544': '0541', // 장한평
  '2545': '0542', // 군자
  '2546': '0543', // 아차산
  '2547': '0544', // 광나루
  '2548': '0545', // 천호
  '2549': '0546', // 강동
  '2550': '0547', // 길동
  '2551': '0548', // 굽은다리
  '2552': '0549', // 명일
  '2553': '0550', // 고덕
  '2554': '0551', // 상일동
  '2555': '0557', // 둔촌동
  '2556': '0936', // 올림픽공원
  '2557': '0558', // 방이
  '2558': '0330', // 오금
  '2559': '0559', // 개롱
  '2560': '0560', // 거여
  '2561': '0561', // 마천
  '2562': '0552', // 강일
  '2563': '0553', // 미사
  '2564': '0554', // 하남풍산
  '2565': '0555', // 하남시청
  '2566': '0556', // 하남검단산
  // ── 6호선 (26xx → 06xx) ──
  '2611': '0610', // 응암
  '2612': '0611', // 역촌
  '2613': '0307', // 불광
  '2614': '0632', // 독바위
  '2615': '0306', // 연신내
  '2616': '0633', // 구산
  '2617': '0614', // 새절
  '2618': '0613', // 증산
  '2619': '0612', // 디지털미디어시티
  '2620': '0634', // 월드컵경기장
  '2621': '0615', // 마포구청
  '2622': '0616', // 망원
  '2623': '0238', // 합정
  '2624': '0635', // 상수
  '2625': '0617', // 광흥창
  '2626': '0618', // 대흥
  '2627': '0529', // 공덕
  '2628': '0619', // 효창공원앞
  '2629': '0422', // 삼각지
  '2630': '0620', // 녹사평
  '2631': '0621', // 이태원
  '2632': '0622', // 한강진
  '2633': '0623', // 버티고개
  '2634': '0313', // 약수
  '2635': '0536', // 청구
  '2636': '0205', // 신당
  '2637': '0624', // 동묘앞
  '2638': '0636', // 창신
  '2639': '0637', // 보문
  '2640': '0638', // 안암
  '2641': '0639', // 고려대
  '2642': '0640', // 월곡
  '2643': '0625', // 상월곡
  '2644': '0626', // 돌곶이
  '2645': '0162', // 석계
  '2646': '0628', // 태릉입구
  '2647': '0629', // 화랑대
  '2648': '0630', // 봉화산
  '2649': '0631', // 신내
  // ── 7호선 (27xx → 07xx) ──
  '2711': '0709', // 장암
  '2712': '0169', // 도봉산
  '2713': '0711', // 수락산
  '2714': '0712', // 마들
  '2715': '0409', // 노원
  '2716': '0714', // 중계
  '2717': '0715', // 하계
  '2718': '0716', // 공릉
  '2719': '0628', // 태릉입구
  '2720': '0717', // 먹골
  '2721': '0723', // 중화
  '2722': '0718', // 상봉
  '2723': '0719', // 면목
  '2724': '0720', // 사가정
  '2725': '0721', // 용마산
  '2726': '0722', // 중곡
  '2727': '0542', // 군자
  '2728': '0724', // 어린이대공원
  '2729': '0212', // 건대입구
  '2730': '0747', // 자양(뚝섬한강공원)
  '2731': '0726', // 청담
  '2732': '0727', // 강남구청
  '2733': '0728', // 학동
  '2734': '0729', // 논현
  '2735': '0730', // 반포
  '2736': '0319', // 고속터미널
  '2737': '0731', // 내방
  '2738': '0732', // 이수
  '2739': '0733', // 남성
  '2740': '0734', // 숭실대입구
  '2741': '0735', // 상도
  '2742': '0736', // 장승배기
  '2743': '0234', // 신대방삼거리
  '2744': '0738', // 보라매
  '2745': '0739', // 신풍
  '2746': '0231', // 대림
  '2747': '0741', // 남구로
  '2748': '0742', // 가산디지털단지
  '2749': '0743', // 철산
  '2750': '0744', // 광명사거리
  '2751': '0745', // 천왕
  '2752': '0746', // 온수
  // ── 8호선 (28xx → 08xx) ──
  '2810': '0809', // 암사역사공원
  '2811': '0810', // 암사
  '2812': '0545', // 천호
  '2813': '0812', // 강동구청
  '2814': '0813', // 몽촌토성
  '2815': '0216', // 잠실
  '2816': '0815', // 석촌
  '2817': '0816', // 송파
  '2818': '0328', // 가락시장
  '2819': '0818', // 문정
  '2820': '0819', // 장지
  '2821': '0820', // 복정
  '2822': '0821', // 산성
  '2823': '0822', // 남한산성입구
  '2824': '0823', // 단대오거리
  '2825': '0824', // 신흥
  '2826': '0825', // 수진
  '2827': '0826', // 모란
  '2828': '0827', // 남위례
  // ── 1호선/6호선 ──
  '0159': '0624', // 동묘앞
};

/**
 * Normalize API station code to stations.ts canonical code.
 * If no mapping exists, returns the original code.
 */
function normalizeStationCode(apiCode) {
  return STATION_CODE_MAP[apiCode] || apiCode;
}

function getRealtimeDataDir() {
  return path.join(ROOT, "data", "realtime");
}

function normalizeEnvironmentData(environmentData) {
  if (
    !environmentData ||
    typeof environmentData.pm10 !== "number" ||
    typeof environmentData.pm25 !== "number" ||
    !environmentData.pm10_grade ||
    !environmentData.pm25_grade
  ) {
    return undefined;
  }

  return {
    collected_at: environmentData.collected_at,
    pm10: environmentData.pm10,
    pm25: environmentData.pm25,
    pm10_grade: environmentData.pm10_grade,
    pm25_grade: environmentData.pm25_grade,
  };
}

async function loadPreviousLatest() {
  const outputPath = path.join(ROOT, "web", "public", "data", "latest.json");
  return loadJSON(outputPath);
}

function extractRealtimeFromLatest(latest, type) {
  if (!latest?.stations) return null;

  const facilities = [];
  for (const [code, station] of Object.entries(latest.stations)) {
    const typeFacilities = station.facilities?.[type] || [];
    for (const f of typeFacilities) {
      facilities.push({
        station_code: code,
        station_name: station.name || "",
        line: station.lines?.[0] || "",
        facility_id: f.facility_id || "",
        location_detail: f.location_detail || "",
        floor_from: f.floor_from || "",
        floor_to: f.floor_to || "",
        status: f.status || "UNKNOWN",
        status_code: f.status_code || "04",
      });
    }
  }

  if (facilities.length === 0) return null;

  const operatingCount = facilities.filter((f) => f.status === "OPERATING").length;
  const faultCount = facilities.filter((f) => f.status === "FAULT").length;

  return {
    collected_at: latest.updated_at,
    source_api: "fallback",
    total_count: facilities.length,
    operating_count: operatingCount,
    fault_count: faultCount,
    facilities,
  };
}

async function main() {
  console.log("Building latest.json...");

  // Load previous latest.json for fallback
  const previousLatest = await loadPreviousLatest();

  // Read from fixed realtime data directory
  const dirPath = getRealtimeDataDir();
  console.log(`Reading realtime data from: ${dirPath}`);

  // Read all 5 realtime JSON files
  const realtimeData = {};
  for (const type of REALTIME_TYPES) {
    const filePath = path.join(dirPath, `${type}.json`);
    const data = await loadJSON(filePath);
    if (data) {
      realtimeData[type] = data;
      console.log(`  Loaded ${type}: ${data.total_count} facilities`);
    } else {
      // Fall back to previous latest.json data for this type
      const fallback = extractRealtimeFromLatest(previousLatest, type);
      if (fallback) {
        realtimeData[type] = fallback;
        console.warn(`  FALLBACK ${type}: using previous data (${fallback.total_count} facilities)`);
      } else {
        console.warn(`  WARNING: Missing ${type}.json and no fallback available`);
      }
    }
  }

  // Read all 4 static JSON files
  const staticData = {};
  const staticDir = path.join(ROOT, "data-static");
  for (const type of STATIC_TYPES) {
    const filePath = path.join(staticDir, `${type}.json`);
    const data = await loadJSON(filePath);
    if (data) {
      staticData[type] = data;
      console.log(`  Loaded static ${type}: ${data.total_count} facilities`);
    } else {
      console.warn(`  WARNING: Missing static ${type}.json`);
    }
  }

  const environmentPath = path.join(staticDir, "air-quality.json");
  const environmentData = normalizeEnvironmentData(await loadJSON(environmentPath));
  if (environmentData) {
    console.log("  Loaded environment air-quality");
  } else {
    console.warn("  WARNING: Missing static air-quality.json");
  }

  // Calculate updated_at from the latest realtime collection
  let updatedAt = null;
  for (const type of REALTIME_TYPES) {
    if (realtimeData[type]?.collected_at) {
      const t = new Date(realtimeData[type].collected_at);
      if (!updatedAt || t > updatedAt) {
        updatedAt = t;
      }
    }
  }
  updatedAt = updatedAt || new Date();

  // Calculate data age
  const now = new Date();
  const dataAgeMinutes = Math.round((now - updatedAt) / 1000 / 60);
  const isStale = dataAgeMinutes > 15;

  // Calculate summary counts per facility type
  const summary = {};
  for (const type of REALTIME_TYPES) {
    const data = realtimeData[type];
    summary[type] = {
      total: data?.total_count || 0,
      operating: data?.operating_count || 0,
      fault: data?.fault_count || 0,
    };
  }

  // Merge by station_code
  const stations = {};

  // Process realtime facilities
  for (const type of REALTIME_TYPES) {
    const data = realtimeData[type];
    if (!data?.facilities) continue;

    for (const facility of data.facilities) {
      const code = normalizeStationCode(facility.station_code);
      if (!code) continue;

      if (!stations[code]) {
        stations[code] = {
          name: facility.station_name || "",
          lines: [],
          lat: 0,
          lng: 0,
          facilities: {},
          disabled_restroom: [],
          sign_language_phone: [],
          wheelchair_charger: [],
          helper: [],
        };
      }

      const station = stations[code];

      // Add line if not already present
      if (facility.line && !station.lines.includes(facility.line)) {
        station.lines.push(facility.line);
      }

      // Add facility to its type array
      if (!station.facilities[type]) {
        station.facilities[type] = [];
      }
      station.facilities[type].push({
        facility_id: facility.facility_id,
        location_detail: facility.location_detail,
        floor_from: facility.floor_from,
        floor_to: facility.floor_to,
        status: facility.status,
        status_code: facility.status_code,
      });
    }
  }

  // Process static facilities
  for (const type of STATIC_TYPES) {
    const data = staticData[type];
    if (!data?.facilities) continue;

    // Convert kebab-case to snake_case for the boolean field name
    const fieldName = type.replace(/-/g, "_");

    for (const facility of data.facilities) {
      const code = normalizeStationCode(facility.station_code);
      if (!code) continue;

      if (!stations[code]) {
        stations[code] = {
          name: facility.station_name || "",
          lines: [],
          lat: 0,
          lng: 0,
          facilities: {},
          disabled_restroom: [],
          sign_language_phone: [],
          wheelchair_charger: [],
          helper: [],
        };
      }

      const station = stations[code];

      // Add line if not already present
      if (facility.line && !station.lines.includes(facility.line)) {
        station.lines.push(facility.line);
      }

      // Add static facility details
      if (!station[fieldName]) {
        station[fieldName] = [];
      }
      station[fieldName].push({
        id: facility.id || `${type}-${station[fieldName].length + 1}`,
        location: facility.location || "",
        detail: facility.detail || "",
      });
    }
  }

  // Build the final output
  const latestData = {
    updated_at: updatedAt.toISOString(),
    data_age_minutes: dataAgeMinutes,
    is_stale: isStale,
    environment: environmentData,
    summary,
    stations,
  };

  // Write to web/public/data/latest.json (served as static asset)
  const outputPath = path.join(ROOT, "web", "public", "data", "latest.json");

  // Compare with previous output excluding volatile fields
  // updated_at, data_age_minutes, is_stale change every run based on wall-clock time
  if (previousLatest) {
    const stripVolatile = ({ updated_at, data_age_minutes, is_stale, ...rest }) => rest;
    const prevStable = JSON.stringify(stripVolatile(previousLatest));
    const newStable = JSON.stringify(stripVolatile(latestData));
    if (prevStable === newStable) {
      console.log("\nlatest.json: no data changes, refreshing timestamp only");
    }
  }

  await saveJSON(outputPath, latestData);

  console.log(`\nBuilt latest.json:`);
  console.log(`  Updated at: ${latestData.updated_at}`);
  console.log(`  Data age: ${dataAgeMinutes} minutes (stale: ${isStale})`);
  console.log(`  Stations: ${Object.keys(stations).length}`);
  console.log(`  Output: ${outputPath}`);
}

main().catch((err) => {
  console.error("Failed to build latest.json:", err.message);
  process.exit(1);
});
