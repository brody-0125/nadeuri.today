import "dotenv/config";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { collect as collectAirQuality } from "./api/air-quality.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HASH_FILE = path.join(ROOT, "data-static", ".last-env-hash.json");

function hashEnvironment(result) {
  const payload = {
    pm10: result.pm10,
    pm25: result.pm25,
    pm10_grade: result.pm10_grade,
    pm25_grade: result.pm25_grade,
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function loadHash() {
  try {
    const content = await readFile(HASH_FILE, "utf-8");
    return JSON.parse(content).hash;
  } catch {
    return null;
  }
}

async function saveHash(hash) {
  await mkdir(path.dirname(HASH_FILE), { recursive: true });
  await writeFile(HASH_FILE, JSON.stringify({ hash }, null, 2), "utf-8");
}

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

    const hash = hashEnvironment(result);
    const prevHash = await loadHash();
    if (prevHash === hash) {
      console.log(`  air-quality: unchanged — skipped`);
      process.exit(0);
    }

    const filePath = path.join(outDir, "air-quality.json");
    await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
    await saveHash(hash);
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
