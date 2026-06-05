import { access, cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const deviceAssets = path.resolve(process.argv[3]);
const targets = ["gt.r", "gt.s"];

async function hasManifest(directory) {
  try {
    await access(path.join(directory, "manifest.json"));
    return true;
  } catch {
    return false;
  }
}

async function listPackSources(directory) {
  if (await hasManifest(directory)) return [directory];

  const packSources = [];
  for (const entry of await readdir(directory)) {
    const child = path.join(directory, entry);
    const info = await stat(child);
    if (info.isDirectory() && await hasManifest(child)) packSources.push(child);
  }
  return packSources.sort();
}

function assertInsideAssets(destination) {
  const relative = path.relative(deviceAssets, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`refusing to stage outside ${deviceAssets}`);
  }
}

const packSources = await listPackSources(source);
if (packSources.length === 0) throw new Error(`no pet packs found in ${source}`);

for (const target of targets) {
  const destinationRoot = path.join(deviceAssets, target, "pets");
  assertInsideAssets(destinationRoot);
  await rm(destinationRoot, { recursive: true, force: true });
  await mkdir(destinationRoot, { recursive: true });

  for (const packSource of packSources) {
    await cp(packSource, path.join(destinationRoot, path.basename(packSource)), { recursive: true });
  }
}

console.log(`staged ${packSources.length} pet pack(s) for device app ${targets.join(" and ")}`);
