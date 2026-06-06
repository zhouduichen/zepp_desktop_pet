import { access, copyFile, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
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

function deviceFramePaths(form) {
  return [
    form?.static,
    form?.aod,
    form?.actions?.feed ? `${form.actions.feed.prefix}7.png` : null,
    form?.actions?.tapReact ? `${form.actions.tapReact.prefix}3.png` : null,
    form?.actions?.happy ? `${form.actions.happy.prefix}4.png` : null,
    form?.actions?.noFood ? `${form.actions.noFood.prefix}3.png` : null
  ].filter(Boolean);
}

async function copyDevicePack(packSource, destination) {
  const manifestPath = path.join(packSource, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await mkdir(destination, { recursive: true });
  await copyFile(manifestPath, path.join(destination, "manifest.json"));

  const relativePaths = new Set();
  for (const form of Object.values(manifest.forms ?? {})) {
    for (const relativePath of deviceFramePaths(form)) relativePaths.add(relativePath);
  }

  for (const relativePath of relativePaths) {
    const from = path.join(packSource, relativePath);
    const to = path.join(destination, relativePath);
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
  }
}

for (const target of targets) {
  const destinationRoot = path.join(deviceAssets, target, "pets");
  assertInsideAssets(destinationRoot);
  await rm(destinationRoot, { recursive: true, force: true });
  await mkdir(destinationRoot, { recursive: true });

  for (const packSource of packSources) {
    await copyDevicePack(packSource, path.join(destinationRoot, path.basename(packSource)));
  }
}

console.log(`staged ${packSources.length} pet pack(s) for device app ${targets.join(" and ")}`);
