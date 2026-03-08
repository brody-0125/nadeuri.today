import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { collect as collectDisabledRestroom } from "./api/disabled-restroom.js";
import { collect as collectSignLanguagePhone } from "./api/sign-language-phone.js";
import { collect as collectWheelchairCharger } from "./api/wheelchair-charger.js";
import { collect as collectHelper } from "./api/helper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

  const errors = [];

  for (const { name, collect } of STATIC_TYPES) {
    try {
      console.log(`Collecting ${name}...`);
      const result = await collect(apiKey);
      const filePath = path.join(outDir, `${name}.json`);
      await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ${name}: ${result.total_count} facilities`);
    } catch (err) {
      console.error(`  ERROR collecting ${name}: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  if (errors.length > 0) {
    console.log(`\nCompleted with ${errors.length} error(s):`);
    errors.forEach(({ name, error }) => console.log(`  - ${name}: ${error}`));
  } else {
    console.log("\nAll static collections completed successfully.");
  }

  process.exit(0);
}

main();
