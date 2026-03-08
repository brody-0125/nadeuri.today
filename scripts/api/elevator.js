import { readFile } from "fs/promises";
import { fetchApi } from "./client.js";

function mapStatus(code) {
  const normalized = String(code).trim();
  if (normalized === "01" || normalized === "1") return { status: "OPERATING", status_code: "01" };
  if (normalized === "02" || normalized === "2") return { status: "FAULT", status_code: "02" };
  if (normalized === "03" || normalized === "3") return { status: "MAINTENANCE", status_code: "03" };
  return { status: "UNKNOWN", status_code: "04" };
}

function resolveField(row, fieldSpec) {
  const candidates = Array.isArray(fieldSpec) ? fieldSpec : [fieldSpec];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = row[candidate];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
}

function resolveServiceName(raw, endpoint) {
  const candidates = [endpoint.serviceName, ...(endpoint.serviceNames || [])].filter(Boolean);

  for (const candidate of candidates) {
    if (Array.isArray(raw?.[candidate]?.row)) {
      return candidate;
    }
  }

  return endpoint.serviceName;
}

export async function collect(apiKey) {
  const configPath = new URL("../config/api-endpoints.json", import.meta.url);
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const endpoint = config.realtime.elevator;
  const url = endpoint.url.replace("{KEY}", apiKey);
  const fields = endpoint.fields;

  const raw = await fetchApi(url);

  if (raw.error) {
    return {
      collected_at: new Date().toISOString(),
      source_api: endpoint.serviceName,
      total_count: 0,
      operating_count: 0,
      fault_count: 0,
      facilities: [],
      error: raw.message,
    };
  }

  // Investigated mapping for elevator ingestion:
  // - OA-15994 service/key set: tbTraficElvtr / RAIL_OPR_ISTT_CD / STATN_NM / ELV_NO /
  //   OPER_STTS_CD / INSTL_PSTN / LN_NM / STRT_FLOOR / END_FLOOR
  // - OA-22740 live sampling was blocked in this sandbox, so compatibility aliases are
  //   accepted for the likely replacement keys: STATN_ID, STATN_CD, ELVTR_NO,
  //   OPER_STTUS_CD, INSTALL_POS, LINE_NM, FROM_FLOOR, TO_FLOOR
  const serviceName = resolveServiceName(raw, endpoint);
  const rows = raw[serviceName]?.row || [];
  let operatingCount = 0;
  let faultCount = 0;

  const facilities = rows.map((row) => {
    const { status, status_code } = mapStatus(resolveField(row, fields.status_code));
    if (status === "OPERATING") operatingCount++;
    if (status === "FAULT") faultCount++;

    return {
      station_code: resolveField(row, fields.station_code),
      station_name: resolveField(row, fields.station_name),
      line: resolveField(row, fields.line),
      facility_id: resolveField(row, fields.facility_id),
      location_detail: resolveField(row, fields.location_detail),
      floor_from: resolveField(row, fields.floor_from),
      floor_to: resolveField(row, fields.floor_to),
      status,
      status_code,
      last_normal_at: null,
    };
  });

  return {
    collected_at: new Date().toISOString(),
    source_api: serviceName,
    total_count: facilities.length,
    operating_count: operatingCount,
    fault_count: faultCount,
    facilities,
  };
}
