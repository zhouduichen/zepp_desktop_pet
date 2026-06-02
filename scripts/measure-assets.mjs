import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2]);
const files = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const filePath = path.join(directory, name);
    const info = await stat(filePath);
    if (info.isDirectory()) await walk(filePath);
    else files.push({ file: path.relative(root, filePath), bytes: info.size });
  }
}

await walk(root);
const bytes = files.reduce((total, file) => total + file.bytes, 0);
console.log(JSON.stringify({ root, fileCount: files.length, bytes, files }, null, 2));
