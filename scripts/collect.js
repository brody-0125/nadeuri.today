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

  // Use Asia/Seoul timezone for directory names
  const now = new Date();
  const seoulFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const seoulTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateStr = seoulFormatter.format(now); // YYYY-MM-DD
  const timeStr = seoulTimeFormatter.format(now).replace(":", "-"); // HH-MM

  const outDir = path.join(ROOT, "data", dateStr, timeStr);
  await mkdir(outDir, { recursive: true });

  console.log(`Collecting realtime data to ${outDir}`);

  const errors = [];

  for (const { name, collect } of REALTIME_TYPES) {
    try {
      console.log(`Collecting ${name}...`);
      const result = await collect(apiKey);
      const filePath = path.join(outDir, `${name}.json`);
      await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ${name}: ${result.total_count} facilities (${result.operating_count} operating, ${result.fault_count} fault)`);
    } catch (err) {
      console.error(`  ERROR collecting ${name}: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  // Set COLLECT_TIME env var for GitHub Actions commit message
  const collectTime = `${dateStr} ${timeStr.replace("-", ":")}`;
  process.env.COLLECT_TIME = collectTime;

  // Write to GITHUB_ENV if available (for GitHub Actions)
  if (process.env.GITHUB_ENV) {
    const { appendFile } = await import("fs/promises");
    await appendFile(process.env.GITHUB_ENV, `COLLECT_TIME=${collectTime}\n`);
  }

  if (errors.length > 0) {
    console.log(`\nCompleted with ${errors.length} error(s):`);
    errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  } else {
    console.log("\nAll collections completed successfully.");
  }

  // Exit with 0 even if some collections failed
  process.exit(0);
}

main();
