import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { collect as collectAirQuality } from "./api/air-quality.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const apiKey = process.env.SEOUL_API_KEY;

  if (!apiKey) {
    console.error("SEOUL_API_KEY environment variable is required");
    process.exit(1);
  }

  const outDir = path.join(ROOT, "data-static");
  await mkdir(outDir, { recursive: true });

  console.log(`Collecting environment data to ${outDir}`);

  try {
    const result = await collectAirQuality(apiKey);
    const filePath = path.join(outDir, "air-quality.json");
    await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
    console.log(
      `  air-quality: PM10 ${result.pm10 ?? "N/A"} (${result.pm10_grade ?? "N/A"}), PM2.5 ${result.pm25 ?? "N/A"} (${result.pm25_grade ?? "N/A"})`,
    );
    process.exit(0);
  } catch (err) {
    console.error(`Failed to collect environment data: ${err.message}`);
    process.exit(1);
  }
}

main();
