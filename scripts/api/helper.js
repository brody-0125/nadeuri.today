import { readFile } from "fs/promises";
import { fetchApi } from "./client.js";

export async function collect(apiKey) {
  const configPath = new URL("../config/api-endpoints.json", import.meta.url);
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const endpoint = config.static.helper;
  const url = endpoint.url.replace("{KEY}", apiKey);
  const fields = endpoint.fields;

  const raw = await fetchApi(url);

  if (raw.error) {
    return {
      collected_at: new Date().toISOString(),
      source_api: endpoint.serviceName,
      total_count: 0,
      facilities: [],
      error: raw.message,
    };
  }

  const rows = raw[endpoint.serviceName]?.row || [];

  const facilities = rows.map((row, index) => ({
    id: `helper-${index + 1}`,
    station_code: row[fields.station_code] || "",
    station_name: row[fields.station_name] || "",
    line: row[fields.line] || "",
    location: row[fields.location_detail] || "",
    detail: row[fields.facility_id] || "",
  }));

  return {
    collected_at: new Date().toISOString(),
    source_api: endpoint.serviceName,
    total_count: facilities.length,
    facilities,
  };
}
