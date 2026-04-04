import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { hashJSON, loadJSON, saveJSON } from "./lib/json-utils.js";

import { collect as collectElevator } from "./api/elevator.js";
import { collect as collectEscalator } from "./api/escalator.js";
import { collect as collectMovingWalk } from "./api/moving-walk.js";
import { collect as collectWheelchairLift } from "./api/wheelchair-lift.js";
import { collect as collectSafetyBoard } from "./api/safety-board.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HASH_FILE = path.join(ROOT, "data", ".last-hashes.json");

/**
 * Check if a collection result contains meaningful data.
 * Returns false if: no facilities, or all facilities have empty station_code
 * and UNKNOWN status (indicating API returned rows but field mapping failed).
 */
function isValidCollection(result) {
  if (!result || result.error) return false;
  if (!result.facilities || result.facilities.length === 0) return false;

  const hasAnyValidFacility = result.facilities.some(
    (f) => (f.station_code && f.station_code !== "") || f.status !== "UNKNOWN"
  );

  return hasAnyValidFacility;
}

/**
 * Excludes collected_at so only actual facility state changes are detected.
 */
function hashFacilities(result) {
  return hashJSON(result.facilities.map((f) => ({
    station_code: f.station_code,
    facility_id: f.facility_id,
    status: f.status,
    status_code: f.status_code,
    location_detail: f.location_detail,
    floor_from: f.floor_from,
    floor_to: f.floor_to,
  })));
}

const REALTIME_TYPES = [
  { name: "elevator", collect: collectElevator },
  { name: "escalator", collect: collectEscalator },
  { name: "moving-walk", collect: collectMovingWalk },
  { name: "wheelchair-lift", collect: collectWheelchairLift },
  { name: "safety-board", collect: collectSafetyBoard },
];

async function main() {
  const args = process.argv.slice(2);
  const apiKey = process.env.SEOUL_API_KEY;

  if (!apiKey) {
    console.error("SEOUL_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!args.includes("--all-realtime")) {
    console.log("Usage: node collect.js --all-realtime");
    process.exit(0);
  }

  const outDir = path.join(ROOT, "data", "realtime");

  console.log(`Collecting realtime data to ${outDir}`);

  const prevHashes = await loadJSON(HASH_FILE, {});
  const newHashes = { ...prevHashes };
  const errors = [];
  const skipped = [];
  const unchanged = [];
  let hasChanges = false;

  for (const { name, collect } of REALTIME_TYPES) {
    try {
      console.log(`Collecting ${name}...`);
      const result = await collect(apiKey);

      // Validate: skip if data looks empty/invalid
      if (!isValidCollection(result)) {
        console.warn(`  SKIP ${name}: data appears empty or invalid (all fields blank / all UNKNOWN)`);
        skipped.push(name);
        continue;
      }

      // Hash-based change detection: skip writing if data unchanged
      const hash = hashFacilities(result);
      if (prevHashes[name] === hash) {
        // Refresh collected_at timestamp so build-latest.js sees fresh data
        const filePath = path.join(outDir, `${name}.json`);
        const existing = await loadJSON(filePath);
        if (existing) {
          existing.collected_at = new Date().toISOString();
          await mkdir(outDir, { recursive: true });
          await writeFile(filePath, JSON.stringify(existing, null, 2), "utf-8");
        }
        console.log(`  ${name}: unchanged (${result.total_count} facilities) — timestamp refreshed`);
        unchanged.push(name);
        continue;
      }

      newHashes[name] = hash;
      hasChanges = true;

      await mkdir(outDir, { recursive: true });
      const filePath = path.join(outDir, `${name}.json`);
      await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ${name}: ${result.total_count} facilities (${result.operating_count} operating, ${result.fault_count} fault)`);
    } catch (err) {
      console.error(`  ERROR collecting ${name}: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  // Save updated hashes
  if (hasChanges) {
    await saveJSON(HASH_FILE, newHashes);
  }

  // Set COLLECT_TIME env var for GitHub Actions commit message
  const now = new Date();
  const collectTime = now.toLocaleString("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  process.env.COLLECT_TIME = collectTime;

  // Write to GITHUB_ENV if available (for GitHub Actions)
  if (process.env.GITHUB_ENV) {
    const sanitized = collectTime.replace(/[\n\r]/g, "");
    const { appendFile } = await import("fs/promises");
    await appendFile(process.env.GITHUB_ENV, `COLLECT_TIME=${sanitized}\n`);
  }

  if (unchanged.length > 0) {
    console.log(`\nUnchanged ${unchanged.length} type(s): ${unchanged.join(", ")}`);
  }

  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} type(s) due to invalid data: ${skipped.join(", ")}`);
  }

  if (errors.length > 0) {
    console.log(`Completed with ${errors.length} error(s):`);
    errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  } else if (skipped.length === 0 && unchanged.length === 0) {
    console.log("\nAll collections completed successfully.");
  }

  // Exit with 0 even if some collections failed
  process.exit(0);
}

main();
