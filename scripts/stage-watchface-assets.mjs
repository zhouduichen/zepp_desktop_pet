import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const watchfaceAssets = path.resolve(process.argv[3]);

const targets = [
  { name: "gt", shape: "r" },
  { name: "gt", shape: "s" }
];

for (const target of targets) {
  const assetDirectory = `${target.name}.${target.shape}`;
  const destination = path.join(watchfaceAssets, assetDirectory, path.basename(source));
  if (!destination.startsWith(`${watchfaceAssets}${path.sep}`)) {
    throw new Error(`refusing to stage outside ${watchfaceAssets}`);
  }
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}
console.log(`staged pixel-cat assets for ${targets.map(t => `${t.name}.${t.shape}`).join(" and ")}`);
