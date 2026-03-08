import { fetchAllFacilities, filterAndMap } from "./seoul-metro-faci.js";

export async function collect(apiKey) {
  const rows = await fetchAllFacilities(apiKey);

  if (rows.error) {
    return {
      collected_at: new Date().toISOString(),
      source_api: "SeoulMetroFaciInfo",
      total_count: 0,
      operating_count: 0,
      fault_count: 0,
      facilities: [],
      error: rows.message,
    };
  }

  return filterAndMap(rows, "WL");
}
