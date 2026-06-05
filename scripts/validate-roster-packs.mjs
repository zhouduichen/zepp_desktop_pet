import { readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "pet-packs");
const entries = await readdir(root);
const manifestPaths = [];

for (const entry of entries) {
  const packPath = path.join(root, entry);
  const info = await stat(packPath);
  if (info.isDirectory()) manifestPaths.push(path.join(packPath, "manifest.json"));
}

let failed = false;
for (const manifestPath of manifestPaths.sort()) {
  const child = spawn(process.execPath, ["scripts/validate-pet-pack.mjs", manifestPath], {
    cwd: path.resolve("."),
    stdio: "inherit"
  });
  const exitCode = await new Promise((resolve) => child.on("exit", resolve));
  if (exitCode !== 0) failed = true;
}

if (failed) process.exitCode = 1;
else console.log(`valid roster packs: ${manifestPaths.length}`);
