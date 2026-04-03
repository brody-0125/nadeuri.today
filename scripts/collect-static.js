import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { hashJSON, loadJSON, saveJSON } from "./lib/json-utils.js";

import { collect as collectDisabledRestroom } from "./api/disabled-restroom.js";
import { collect as collectSignLanguagePhone } from "./api/sign-language-phone.js";
import { collect as collectWheelchairCharger } from "./api/wheelchair-charger.js";
import { collect as collectHelper } from "./api/helper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HASH_FILE = path.join(ROOT, "data-static", ".last-hashes.json");

/**
 * Excludes collected_at so only actual facility content changes are detected.
 */
function hashStaticFacilities(result) {
  return hashJSON(result.facilities.map((f) => ({
    id: f.id,
    station_code: f.station_code,
    station_name: f.station_name,
    line: f.line,
    location: f.location,
    detail: f.detail,
  })));
}

const STATIC_TYPES = [
  { name: "disabled-restroom", collect: collectDisabledRestroom },
  { name: "sign-language-phone", collect: collectSignLanguagePhone },
  { name: "wheelchair-charger", collect: collectWheelchairCharger },
  { name: "helper", collect: collectHelper },
];

async function main() {
  const apiKey = process.env.SEOUL_API_KEY;

  if (!apiKey) {
    console.error("SEOUL_API_KEY environment variable is required");
    process.exit(1);
  }

  const outDir = path.join(ROOT, "data-static");
  await mkdir(outDir, { recursive: true });

  console.log(`Collecting static data to ${outDir}`);

  const prevHashes = await loadJSON(HASH_FILE, {});
  const newHashes = { ...prevHashes };
  const errors = [];
  const unchanged = [];
  let hasChanges = false;

  for (const { name, collect } of STATIC_TYPES) {
    try {
      console.log(`Collecting ${name}...`);
      const result = await collect(apiKey);

      const hash = hashStaticFacilities(result);
      if (prevHashes[name] === hash) {
        console.log(`  ${name}: unchanged (${result.total_count} facilities) — skipped`);
        unchanged.push(name);
        continue;
      }

      newHashes[name] = hash;
      hasChanges = true;

      const filePath = path.join(outDir, `${name}.json`);
      await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ${name}: ${result.total_count} facilities`);
    } catch (err) {
      console.error(`  ERROR collecting ${name}: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  if (hasChanges) {
    await saveJSON(HASH_FILE, newHashes);
  }

  if (unchanged.length > 0) {
    console.log(`\nUnchanged ${unchanged.length} type(s): ${unchanged.join(", ")}`);
  }

  if (errors.length > 0) {
    console.log(`\nCompleted with ${errors.length} error(s):`);
    errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  } else if (unchanged.length === 0) {
    console.log("\nAll static collections completed successfully.");
  }

  process.exit(0);
}

main();
