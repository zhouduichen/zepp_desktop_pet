import { access, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const watchfaceAssets = path.resolve(process.argv[3]);
const watchfacePetId = process.env.WATCHFACE_PET_ID || "pixel-cat";
const watchfaceFormId = process.env.WATCHFACE_FORM_ID || "baby";

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
const packSource = packSources.find((candidate) => path.basename(candidate) === watchfacePetId);
if (!packSource) throw new Error(`watchface pet pack ${watchfacePetId} was not found in ${source}`);

function watchfaceFramePaths(form) {
  const paths = [form?.static, form?.aod];
  if (form?.actions?.wakeIdle) {
    for (let index = 0; index < form.actions.wakeIdle.frames; index += 1) {
      paths.push(`${form.actions.wakeIdle.prefix}${index}.png`);
    }
  }
  if (form?.actions?.tapReact) {
    for (let index = 0; index < form.actions.tapReact.frames; index += 1) {
      paths.push(`${form.actions.tapReact.prefix}${index}.png`);
    }
  }
  return paths.filter(Boolean);
}

async function copyWatchfacePack(destination) {
  const manifest = JSON.parse(await readFile(path.join(packSource, "manifest.json"), "utf8"));
  const form = manifest.forms?.[watchfaceFormId];
  if (!form) throw new Error(`${watchfacePetId} is missing watchface form ${watchfaceFormId}`);

  const watchfaceManifest = {
    ...manifest,
    forms: {
      [watchfaceFormId]: form
    }
  };

  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "manifest.json"), `${JSON.stringify(watchfaceManifest, null, 2)}\n`);

  for (const relativePath of watchfaceFramePaths(form)) {
    const from = path.join(packSource, relativePath);
    const to = path.join(destination, relativePath);
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
  }
}

for (const target of targets) {
  const assetDirectory = `${target.name}.${target.shape}`;
  const destinationRoot = path.join(watchfaceAssets, assetDirectory);
  assertInsideAssets(destinationRoot);
  await rm(destinationRoot, { recursive: true, force: true });
  await mkdir(destinationRoot, { recursive: true });
  await copyWatchfacePack(path.join(destinationRoot, watchfacePetId));
}

console.log(`staged watchface ${watchfacePetId}/${watchfaceFormId} assets for ${targets.map(t => `${t.name}.${t.shape}`).join(" and ")}`);
