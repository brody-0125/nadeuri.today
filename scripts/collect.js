import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { collect as collectElevator } from "./api/elevator.js";
import { collect as collectEscalator } from "./api/escalator.js";
import { collect as collectMovingWalk } from "./api/moving-walk.js";
import { collect as collectWheelchairLift } from "./api/wheelchair-lift.js";
import { collect as collectSafetyBoard } from "./api/safety-board.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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
  await mkdir(outDir, { recursive: true });

  console.log(`Collecting realtime data to ${outDir}`);

  const errors = [];
  const skipped = [];

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

      const filePath = path.join(outDir, `${name}.json`);
      await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ${name}: ${result.total_count} facilities (${result.operating_count} operating, ${result.fault_count} fault)`);
    } catch (err) {
      console.error(`  ERROR collecting ${name}: ${err.message}`);
      errors.push({ name, error: err.message });
    }
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
    const { appendFile } = await import("fs/promises");
    await appendFile(process.env.GITHUB_ENV, `COLLECT_TIME=${collectTime}\n`);
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} type(s) due to invalid data: ${skipped.join(", ")}`);
  }

  if (errors.length > 0) {
    console.log(`\nCompleted with ${errors.length} error(s):`);
    errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  } else if (skipped.length === 0) {
    console.log("\nAll collections completed successfully.");
  }

  // Exit with 0 even if some collections failed
  process.exit(0);
}

main();
