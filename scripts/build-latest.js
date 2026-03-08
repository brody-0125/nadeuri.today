import "dotenv/config";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

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

async function findLatestDataDir() {
  const dataDir = path.join(ROOT, "data");
  const dateDirs = await readdir(dataDir);
  const sortedDates = dateDirs
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();

  if (sortedDates.length === 0) {
    throw new Error("No data directories found");
  }

  const latestDate = sortedDates[0];
  const timeDirPath = path.join(dataDir, latestDate);
  const timeDirs = await readdir(timeDirPath);
  const sortedTimes = timeDirs
    .filter((d) => /^\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();

  if (sortedTimes.length === 0) {
    throw new Error(`No time directories found in ${latestDate}`);
  }

  const latestTime = sortedTimes[0];
  return {
    dirPath: path.join(dataDir, latestDate, latestTime),
    date: latestDate,
    time: latestTime,
  };
}

async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
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

async function main() {
  console.log("Building latest.json...");

  // Find most recent data directory
  const { dirPath, date, time } = await findLatestDataDir();
  console.log(`Latest data: ${date}/${time}`);

  // Read all 5 realtime JSON files
  const realtimeData = {};
  for (const type of REALTIME_TYPES) {
    const filePath = path.join(dirPath, `${type}.json`);
    const data = await readJsonFile(filePath);
    if (data) {
      realtimeData[type] = data;
      console.log(`  Loaded ${type}: ${data.total_count} facilities`);
    } else {
      console.warn(`  WARNING: Missing ${type}.json`);
    }
  }

  // Read all 4 static JSON files
  const staticData = {};
  const staticDir = path.join(ROOT, "data-static");
  for (const type of STATIC_TYPES) {
    const filePath = path.join(staticDir, `${type}.json`);
    const data = await readJsonFile(filePath);
    if (data) {
      staticData[type] = data;
      console.log(`  Loaded static ${type}: ${data.total_count} facilities`);
    } else {
      console.warn(`  WARNING: Missing static ${type}.json`);
    }
  }

  const environmentPath = path.join(staticDir, "air-quality.json");
  const environmentData = normalizeEnvironmentData(await readJsonFile(environmentPath));
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
      const code = facility.station_code;
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
      const code = facility.station_code;
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
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(latestData, null, 2), "utf-8");

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
