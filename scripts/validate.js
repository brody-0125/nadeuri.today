import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_TOP_LEVEL_FIELDS = [
  "updated_at",
  "data_age_minutes",
  "is_stale",
  "summary",
  "stations",
];

const REQUIRED_STATION_FIELDS = ["name", "facilities"];

async function main() {
  const latestPath = path.join(ROOT, "data", "latest.json");
  let errors = 0;
  let warnings = 0;

  // Check latest.json exists
  let data;
  try {
    const content = await readFile(latestPath, "utf-8");
    data = JSON.parse(content);
    console.log("[OK] latest.json exists and is valid JSON");
  } catch (err) {
    console.error(`[FAIL] Cannot read latest.json: ${err.message}`);
    process.exit(1);
  }

  // Check required top-level fields
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      console.error(`[FAIL] Missing required field: ${field}`);
      errors++;
    } else {
      console.log(`[OK] Field "${field}" is present`);
    }
  }

  // Check updated_at is valid ISO date
  if (data.updated_at) {
    const d = new Date(data.updated_at);
    if (isNaN(d.getTime())) {
      console.error(`[FAIL] updated_at is not a valid ISO date: ${data.updated_at}`);
      errors++;
    } else {
      console.log(`[OK] updated_at is a valid date: ${data.updated_at}`);
    }
  }

  // Check data_age_minutes is a number
  if (typeof data.data_age_minutes !== "number") {
    console.error(`[FAIL] data_age_minutes is not a number: ${data.data_age_minutes}`);
    errors++;
  }

  // Check is_stale is a boolean
  if (typeof data.is_stale !== "boolean") {
    console.error(`[FAIL] is_stale is not a boolean: ${data.is_stale}`);
    errors++;
  }

  // Check stations
  if (data.stations && typeof data.stations === "object") {
    const stationCodes = Object.keys(data.stations);
    console.log(`[OK] Found ${stationCodes.length} stations`);

    let stationErrors = 0;
    for (const code of stationCodes) {
      const station = data.stations[code];
      for (const field of REQUIRED_STATION_FIELDS) {
        if (station[field] === undefined || station[field] === null) {
          if (stationErrors < 5) {
            console.error(`[FAIL] Station ${code} missing field: ${field}`);
          }
          stationErrors++;
          errors++;
        }
      }
    }

    if (stationErrors > 5) {
      console.error(`  ... and ${stationErrors - 5} more station errors`);
    }

    if (stationErrors === 0) {
      console.log("[OK] All stations have required fields (name, facilities)");
    }
  } else {
    console.error("[FAIL] stations is missing or not an object");
    errors++;
  }

  // Check summary
  if (data.summary && typeof data.summary === "object") {
    const facilityTypes = Object.keys(data.summary);
    console.log(`[OK] Summary has ${facilityTypes.length} facility types: ${facilityTypes.join(", ")}`);
  } else {
    console.warn("[WARN] summary is missing or not an object");
    warnings++;
  }

  // Final report
  console.log("\n--- Validation Summary ---");
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  if (errors > 0) {
    console.error("\nValidation FAILED");
    process.exit(1);
  } else {
    console.log("\nValidation PASSED");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Validation error:", err.message);
  process.exit(1);
});
