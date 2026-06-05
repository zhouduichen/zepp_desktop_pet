import { access, cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const watchfaceAssets = path.resolve(process.argv[3]);

const targets = [
  { name: "gt", shape: "r" },
  { name: "gt", shape: "s" }
];

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
  const relative = path.relative(watchfaceAssets, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`refusing to stage outside ${watchfaceAssets}`);
  }
}

const packSources = await listPackSources(source);
if (packSources.length === 0) throw new Error(`no pet packs found in ${source}`);

for (const target of targets) {
  const assetDirectory = `${target.name}.${target.shape}`;
  for (const packSource of packSources) {
    const destination = path.join(watchfaceAssets, assetDirectory, path.basename(packSource));
    assertInsideAssets(destination);
    await rm(destination, { recursive: true, force: true });
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(packSource, destination, { recursive: true });
  }
}

console.log(`staged ${packSources.length} pet pack(s) for ${targets.map(t => `${t.name}.${t.shape}`).join(" and ")}`);
