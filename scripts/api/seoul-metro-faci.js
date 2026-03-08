import { fetchApi } from "./client.js";

const PAGE_SIZE = 1000;
const SERVICE_NAME = "SeoulMetroFaciInfo";

let cachedRows = null;

/**
 * Fetch all rows from SeoulMetroFaciInfo with pagination.
 * Results are cached for the lifetime of the process so multiple
 * collectors can share one fetch.
 */
export async function fetchAllFacilities(apiKey) {
  if (cachedRows) return cachedRows;

  const allRows = [];
  let start = 1;

  while (true) {
    const end = start + PAGE_SIZE - 1;
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/${SERVICE_NAME}/${start}/${end}/`;
    const raw = await fetchApi(url);

    if (raw.error) {
      if (allRows.length > 0) break; // partial data is better than none
      return { error: true, message: raw.message };
    }

    const result = raw[SERVICE_NAME];
    if (!result) break;

    const rows = result.row || [];
    allRows.push(...rows);

    const totalCount = result.list_total_count || 0;
    if (end >= totalCount || rows.length < PAGE_SIZE) break;

    start += PAGE_SIZE;
  }

  cachedRows = allRows;
  return allRows;
}

/**
 * Filter rows by ELVTR_SE and map to our facility format.
 */
export function filterAndMap(rows, elvtrSeCode) {
  const filtered = rows.filter((row) => row.ELVTR_SE === elvtrSeCode);

  let operatingCount = 0;
  let faultCount = 0;

  const facilities = filtered.map((row) => {
    const { status, status_code } = mapStatus(row.USE_YN);
    if (status === "OPERATING") operatingCount++;
    if (status === "FAULT") faultCount++;

    const { floorFrom, floorTo } = parseOprSec(row.OPR_SEC);

    return {
      station_code: row.STN_CD || "",
      station_name: cleanStationName(row.STN_NM || ""),
      line: extractLine(row.STN_NM || ""),
      facility_id: row.ELVTR_NM || "",
      location_detail: row.INSTL_PSTN || "",
      floor_from: floorFrom,
      floor_to: floorTo,
      status,
      status_code,
      last_normal_at: null,
    };
  });

  return {
    collected_at: new Date().toISOString(),
    source_api: SERVICE_NAME,
    total_count: facilities.length,
    operating_count: operatingCount,
    fault_count: faultCount,
    facilities,
  };
}

function mapStatus(useYn) {
  const val = String(useYn || "").trim();
  if (val === "사용가능") return { status: "OPERATING", status_code: "01" };
  if (val === "보수중") return { status: "MAINTENANCE", status_code: "03" };
  if (val === "고장") return { status: "FAULT", status_code: "02" };
  return { status: "UNKNOWN", status_code: "04" };
}

/**
 * Parse OPR_SEC like "B2-B1" or "B1-1F" into floor_from and floor_to.
 */
function parseOprSec(oprSec) {
  if (!oprSec) return { floorFrom: "", floorTo: "" };
  const parts = oprSec.split("-").filter(Boolean);
  if (parts.length === 0) return { floorFrom: "", floorTo: "" };
  // Rejoin compound floor names (e.g. "B1" stays as is, "BM1" stays)
  // For "B2-B1" → ["B2", "B1"], for "B2-BM2-B1" → ["B2", "BM2", "B1"]
  return {
    floorFrom: parts[0] || "",
    floorTo: parts[parts.length - 1] || "",
  };
}

/**
 * Extract line number from station name like "서울역(1)" → "1호선"
 */
function extractLine(stationName) {
  const match = stationName.match(/\((\d+)\)$/);
  if (match) return `${match[1]}호선`;
  if (stationName.includes("(S)")) return "S선";
  return "";
}

/**
 * Remove the line suffix from station name: "서울역(1)" → "서울역"
 */
function cleanStationName(stationName) {
  return stationName.replace(/\(\d+\)$/, "").replace(/\(S\)$/, "").trim();
}
