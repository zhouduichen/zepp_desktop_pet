import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { validatePetPack } from "../core/pet-pack.js";

const manifestPath = path.resolve(process.argv[2]);
const pack = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = validatePetPack(pack);
const baseDir = path.dirname(manifestPath);
const baby = pack.forms?.baby;
const assetPaths = [baby?.static, baby?.aod];

for (const action of Object.values(baby?.actions ?? {})) {
  for (let index = 0; index < action.frames; index += 1) {
    assetPaths.push(`${action.prefix}${index}.png`);
  }
}

for (const relativePath of assetPaths.filter(Boolean)) {
  try {
    await access(path.join(baseDir, relativePath));
  } catch {
    errors.push(`missing asset: ${relativePath}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`valid pet pack: ${pack.id}`);
}
