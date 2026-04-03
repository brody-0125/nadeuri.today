import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export function hashJSON(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function loadJSON(filePath, fallback = null) {
  try {
    return JSON.parse(await readFile(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

export async function saveJSON(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
