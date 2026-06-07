import { readFile, writeFile } from "node:fs/promises";
import { normalizeProfile } from "../device-app/core/profile.js";
import { toDateKey } from "../device-app/core/date-key.js";

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;
if (!inputPath) {
  console.error("Usage: node scripts/migrate-profile.mjs <input.json> [output.json]");
  process.exit(1);
}

const raw = JSON.parse(await readFile(inputPath, "utf8"));
const today = toDateKey(new Date());
const migrated = normalizeProfile(raw, today);
await writeFile(outputPath, JSON.stringify(migrated, null, 2));
console.log(`Migrated ${inputPath} -> ${outputPath} (schemaVersion ${migrated.schemaVersion})`);
