import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve("pet-packs/pixel-cat/baby");
const gridSize = 32;
const scale = 4;

const colors = {
  clear: [0, 0, 0, 0],
  outline: [24, 18, 16, 255],
  orange: [240, 145, 38, 255],
  lightOrange: [255, 181, 72, 255],
  shadowOrange: [181, 84, 29, 255],
  cream: [255, 232, 178, 255],
  white: [255, 248, 224, 255],
  pink: [246, 132, 138, 255],
  aod: [112, 112, 96, 255],
  aodDim: [64, 64, 56, 255]
};

function sameColor(left, right) {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3];
}

function createGrid() {
  return Array.from({ length: gridSize * gridSize }, () => colors.clear);
}

function setPixel(grid, x, y, color) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= gridSize || py >= gridSize) return;
  grid[py * gridSize + px] = color;
}

function rect(grid, x, y, width, height, color) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) setPixel(grid, px, py, color);
  }
}

function ellipse(grid, cx, cy, rx, ry, color) {
  const left = Math.floor(cx - rx);
  const right = Math.ceil(cx + rx);
  const top = Math.floor(cy - ry);
  const bottom = Math.ceil(cy + ry);
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(grid, x, y, color);
    }
  }
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygon(grid, points, color) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const left = Math.floor(Math.min(...xs));
  const right = Math.ceil(Math.max(...xs));
  const top = Math.floor(Math.min(...ys));
  const bottom = Math.ceil(Math.max(...ys));
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (pointInPolygon(x + 0.5, y + 0.5, points)) setPixel(grid, x, y, color);
    }
  }
}

function line(grid, x0, y0, x1, y1, radius, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 3 + 1;
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    ellipse(grid, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius, radius, color);
  }
}

function ringEllipse(grid, cx, cy, rx, ry, color) {
  ellipse(grid, cx, cy, rx, ry, color);
  ellipse(grid, cx, cy, Math.max(0.5, rx - 1.2), Math.max(0.5, ry - 1.2), colors.clear);
}

function drawEar(grid, side, dx, dy, fillColor = colors.lightOrange) {
  const outer = side === "left"
    ? [[8 + dx, 9 + dy], [10 + dx, 2 + dy], [15 + dx, 9 + dy]]
    : [[17 + dx, 9 + dy], [22 + dx, 2 + dy], [24 + dx, 9 + dy]];
  const inner = side === "left"
    ? [[10 + dx, 8 + dy], [11 + dx, 5 + dy], [13 + dx, 8 + dy]]
    : [[19 + dx, 8 + dy], [21 + dx, 5 + dy], [22 + dx, 8 + dy]];
  polygon(grid, outer, colors.outline);
  polygon(grid, outer.map(([x, y]) => [x + (side === "left" ? 1 : -1), y + 1]), fillColor);
  polygon(grid, inner, colors.pink);
  line(grid, inner[0][0], inner[0][1], inner[1][0], inner[1][1], 0.35, colors.shadowOrange);
}

function drawFace(grid, pose, hx, hy) {
  ellipse(grid, 16 + hx, 15 + hy, 4.6, 3.1, colors.cream);
  setPixel(grid, 16 + hx, 14 + hy, colors.outline);
  setPixel(grid, 15 + hx, 15 + hy, colors.outline);
  setPixel(grid, 17 + hx, 15 + hy, colors.outline);

  if (pose.eyes === "closed") {
    rect(grid, 11 + hx, 12 + hy, 3, 1, colors.outline);
    rect(grid, 19 + hx, 12 + hy, 3, 1, colors.outline);
  } else if (pose.eyes === "half") {
    rect(grid, 12 + hx, 12 + hy, 2, 1, colors.outline);
    rect(grid, 20 + hx, 12 + hy, 2, 1, colors.outline);
  } else {
    rect(grid, 11 + hx, 11 + hy, 2, 3, colors.outline);
    rect(grid, 20 + hx, 11 + hy, 2, 3, colors.outline);
    setPixel(grid, 11 + hx, 11 + hy, colors.white);
    setPixel(grid, 20 + hx, 11 + hy, colors.white);
  }

  if (pose.mouth === "happy") {
    rect(grid, 15 + hx, 16 + hy, 3, 2, colors.outline);
    setPixel(grid, 16 + hx, 17 + hy, colors.pink);
  } else if (pose.mouth === "bite") {
    rect(grid, 15 + hx, 16 + hy, 2, 2, colors.outline);
  } else {
    setPixel(grid, 15 + hx, 16 + hy, colors.outline);
    setPixel(grid, 17 + hx, 16 + hy, colors.outline);
  }

  if (pose.blush) {
    rect(grid, 8 + hx, 15 + hy, 2, 1, colors.pink);
    rect(grid, 23 + hx, 15 + hy, 2, 1, colors.pink);
  }
}

function drawCat(pose = {}) {
  const grid = createGrid();
  const bodyY = pose.bodyY ?? 0;
  const hx = pose.headX ?? 0;
  const hy = pose.headY ?? 0;
  const tailLift = pose.tailLift ?? 0;

  line(grid, 22, 21 + bodyY, 28, 17 + bodyY - tailLift, 2.4, colors.outline);
  line(grid, 28, 17 + bodyY - tailLift, 27, 24 + bodyY - tailLift, 2.4, colors.outline);
  line(grid, 22, 21 + bodyY, 28, 17 + bodyY - tailLift, 1.4, colors.orange);
  line(grid, 28, 17 + bodyY - tailLift, 27, 24 + bodyY - tailLift, 1.4, colors.orange);
  rect(grid, 26, 18 + bodyY - tailLift, 2, 1, colors.shadowOrange);

  ellipse(grid, 16, 22 + bodyY, 7.8, 7.2, colors.outline);
  ellipse(grid, 16, 21 + bodyY, 6.5, 6.4, colors.orange);
  ellipse(grid, 16, 23 + bodyY, 3.5, 3.8, colors.cream);

  ellipse(grid, 10, 28 + bodyY, 2.8, 1.9, colors.outline);
  ellipse(grid, 22, 28 + bodyY, 2.8, 1.9, colors.outline);
  ellipse(grid, 10, 27 + bodyY, 1.8, 1.2, colors.cream);
  ellipse(grid, 22, 27 + bodyY, 1.8, 1.2, colors.cream);

  const pawLift = pose.pawLift ?? 0;
  ellipse(grid, 9, 21 + bodyY - pawLift, 2.2, 3.4, colors.outline);
  ellipse(grid, 23, 21 + bodyY - pawLift, 2.2, 3.4, colors.outline);
  ellipse(grid, 9, 21 + bodyY - pawLift, 1.2, 2.2, colors.lightOrange);
  ellipse(grid, 23, 21 + bodyY - pawLift, 1.2, 2.2, colors.lightOrange);

  drawEar(grid, "left", hx, hy);
  drawEar(grid, "right", hx, hy);
  ellipse(grid, 16 + hx, 12 + hy, 8.6, 7.2, colors.outline);
  ellipse(grid, 16 + hx, 12 + hy, 7.2, 5.9, colors.lightOrange);

  rect(grid, 13 + hx, 6 + hy, 1, 4, colors.shadowOrange);
  rect(grid, 16 + hx, 5 + hy, 1, 4, colors.shadowOrange);
  rect(grid, 19 + hx, 6 + hy, 1, 4, colors.shadowOrange);
  rect(grid, 8 + hx, 11 + hy, 2, 1, colors.shadowOrange);
  rect(grid, 23 + hx, 11 + hy, 2, 1, colors.shadowOrange);

  drawFace(grid, {
    eyes: pose.eyes ?? "open",
    mouth: pose.mouth ?? "calm",
    blush: pose.blush ?? true
  }, hx, hy);

  if (pose.food) {
    ellipse(grid, pose.foodX ?? 7, pose.foodY ?? 19, 2, 2, colors.cream);
    setPixel(grid, (pose.foodX ?? 7) - 1, (pose.foodY ?? 19) - 1, colors.shadowOrange);
    setPixel(grid, pose.foodX ?? 7, (pose.foodY ?? 19) + 1, colors.outline);
  }

  return grid;
}

function drawAod() {
  const grid = createGrid();
  line(grid, 22, 22, 28, 18, 1, colors.aod);
  line(grid, 28, 18, 27, 24, 1, colors.aod);
  ringEllipse(grid, 16, 22, 7.4, 6.7, colors.aod);
  polygon(grid, [[9, 9], [10, 3], [14, 9]], colors.aod);
  polygon(grid, [[18, 9], [22, 3], [23, 9]], colors.aod);
  polygon(grid, [[10, 8], [11, 5], [13, 8]], colors.clear);
  polygon(grid, [[19, 8], [21, 5], [22, 8]], colors.clear);
  ringEllipse(grid, 16, 12, 8.1, 6.7, colors.aod);
  rect(grid, 11, 12, 2, 2, colors.aodDim);
  rect(grid, 20, 12, 2, 2, colors.aodDim);
  setPixel(grid, 16, 15, colors.aodDim);
  return grid;
}

function scaleGrid(grid) {
  const width = gridSize * scale;
  const rgba = Buffer.alloc(width * width * 4);
  for (let y = 0; y < width; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = grid[Math.floor(y / scale) * gridSize + Math.floor(x / scale)];
      const offset = (y * width + x) * 4;
      rgba[offset] = source[0];
      rgba[offset + 1] = source[1];
      rgba[offset + 2] = source[2];
      rgba[offset + 3] = source[3];
    }
  }
  return { width, height: width, rgba };
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const trailer = Buffer.alloc(4);
  trailer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([
    Buffer.from([
      (data.length >>> 24) & 255,
      (data.length >>> 16) & 255,
      (data.length >>> 8) & 255,
      data.length & 255
    ]),
    body,
    trailer
  ]);
}

function png(grid) {
  const { width, height, rgba } = scaleGrid(grid);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.concat([Buffer.from([0]), rgba.subarray(start, start + width * 4)]));
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

async function writeFrame(name, grid) {
  await writeFile(path.join(root, name), png(grid));
}

const sequences = {
  wake: [
    { eyes: "closed", headY: 1 },
    { eyes: "half", headY: 0 },
    { eyes: "open", headY: -1, bodyY: -1 },
    { eyes: "open", headY: -1, bodyY: -1, pawLift: 2, mouth: "happy" },
    { eyes: "open", bodyY: 0, pawLift: 1, mouth: "happy" },
    { eyes: "open", bodyY: 0 },
    { eyes: "half", bodyY: 0 },
    { eyes: "open", bodyY: 0 }
  ],
  tap: [
    {},
    { headX: -1, eyes: "open" },
    { headX: -1, pawLift: 1, mouth: "happy" },
    { headX: 1, eyes: "open" },
    { headX: 1, pawLift: 1 },
    { headX: 0, eyes: "half" },
    { headX: 0, mouth: "happy" },
    {}
  ],
  feed: [
    { food: true, foodX: 5, foodY: 22 },
    { food: true, foodX: 7, foodY: 21 },
    { food: true, foodX: 9, foodY: 20 },
    { food: true, foodX: 11, foodY: 19, headX: -1 },
    { food: true, foodX: 13, foodY: 18, headX: -1, mouth: "bite" },
    { food: true, foodX: 15, foodY: 17, mouth: "bite" },
    { mouth: "bite", blush: true },
    { mouth: "happy", blush: true },
    { mouth: "happy", bodyY: -1, pawLift: 1 },
    { mouth: "happy" },
    { eyes: "half" },
    {}
  ],
  happy: [
    {},
    { bodyY: -1, headY: -1, mouth: "happy" },
    { bodyY: -2, headY: -1, pawLift: 2, mouth: "happy", tailLift: 1 },
    { bodyY: -1, headY: -1, pawLift: 3, mouth: "happy", tailLift: 2 },
    { bodyY: 0, pawLift: 2, mouth: "happy" },
    { bodyY: -1, headY: -1, pawLift: 2, mouth: "happy" },
    { bodyY: 0, mouth: "happy" },
    { eyes: "half", mouth: "happy" },
    { mouth: "happy" },
    {}
  ],
  no_food: [
    {},
    { headX: -1, eyes: "half" },
    { headX: -2, eyes: "open" },
    { headX: -1, pawLift: 1 },
    { headX: 1, eyes: "open" },
    { headX: 2, eyes: "half" },
    { headX: 1 },
    {}
  ]
};

await mkdir(root, { recursive: true });
await writeFrame("static.png", drawCat());
await writeFrame("aod.png", drawAod());

for (const [prefix, poses] of Object.entries(sequences)) {
  for (let index = 0; index < poses.length; index += 1) {
    await writeFrame(`${prefix}_${index}.png`, drawCat(poses[index]));
  }
}

console.log("created release-candidate pixel-cat assets");
