import { readFile } from "fs/promises";
import { fetchApi } from "./client.js";

function mapStatus(code) {
  const normalized = String(code).trim();
  if (normalized === "01" || normalized === "1") return { status: "OPERATING", status_code: "01" };
  if (normalized === "02" || normalized === "2") return { status: "FAULT", status_code: "02" };
  if (normalized === "03" || normalized === "3") return { status: "MAINTENANCE", status_code: "03" };
  return { status: "UNKNOWN", status_code: "04" };
}

export async function collect(apiKey) {
  const configPath = new URL("../config/api-endpoints.json", import.meta.url);
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const endpoint = config.realtime["safety-board"];
  const url = endpoint.url.replace("{KEY}", apiKey);
  const fields = endpoint.fields;

  const raw = await fetchApi(url, { apiKey });

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

  const rows = raw[endpoint.serviceName]?.row || [];
  let operatingCount = 0;
  let faultCount = 0;

  const facilities = rows.map((row) => {
    const { status, status_code } = mapStatus(row[fields.status_code]);
    if (status === "OPERATING") operatingCount++;
    if (status === "FAULT") faultCount++;

    return {
      station_code: row[fields.station_code] || "",
      station_name: row[fields.station_name] || "",
      line: row[fields.line] || "",
      facility_id: row[fields.facility_id] || "",
      location_detail: row[fields.location_detail] || "",
      floor_from: row[fields.floor_from] || "",
      floor_to: row[fields.floor_to] || "",
      status,
      status_code,
      last_normal_at: null,
    };
  });

  return {
    collected_at: new Date().toISOString(),
    source_api: endpoint.serviceName,
    total_count: facilities.length,
    operating_count: operatingCount,
    fault_count: faultCount,
    facilities,
  };
}
