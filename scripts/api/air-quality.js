import { readFile } from "fs/promises";
import { fetchApi } from "./client.js";

function resolveField(row, fieldSpec) {
  const candidates = Array.isArray(fieldSpec) ? fieldSpec : [fieldSpec];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = row?.[candidate];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const normalized = Number(String(value).trim());
  return Number.isFinite(normalized) ? normalized : null;
}

function formatCollectedAt() {
  return new Date().toISOString();
}

function getPm10Grade(value) {
  if (value === null) return null;
  if (value <= 30) return "좋음";
  if (value <= 80) return "보통";
  if (value <= 150) return "나쁨";
  return "매우나쁨";
}

function getPm25Grade(value) {
  if (value === null) return null;
  if (value <= 15) return "좋음";
  if (value <= 35) return "보통";
  if (value <= 75) return "나쁨";
  return "매우나쁨";
}

export async function collect(apiKey) {
  const configPath = new URL("../config/api-endpoints.json", import.meta.url);
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const endpoint = config.environment.air_quality;
  const url = endpoint.url.replace("{KEY}", apiKey);
  const fields = endpoint.fields;

  const raw = await fetchApi(url);

  if (raw.error) {
    return {
      collected_at: formatCollectedAt(),
      source_api: endpoint.serviceName,
      pm10: null,
      pm25: null,
      pm10_grade: null,
      pm25_grade: null,
      error: raw.message,
    };
  }

  const row = raw?.[endpoint.serviceName]?.row?.[0];
  const pm10 = parseNumber(resolveField(row, fields.pm10));
  const pm25 = parseNumber(resolveField(row, fields.pm25));

  return {
    collected_at: formatCollectedAt(),
    source_api: endpoint.serviceName,
    pm10,
    pm25,
    pm10_grade: getPm10Grade(pm10),
    pm25_grade: getPm25Grade(pm25),
  };
}
