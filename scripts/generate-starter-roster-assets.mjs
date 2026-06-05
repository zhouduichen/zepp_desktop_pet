import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const gridSize = 64;
const scale = 2;
const root = path.resolve("pet-packs");

const commonActions = {
  wakeIdle: { prefix: "baby/wake_", frames: 8, fps: 8 },
  tapReact: { prefix: "baby/tap_", frames: 8, fps: 8 },
  feed: { prefix: "baby/feed_", frames: 12, fps: 10 },
  happy: { prefix: "baby/happy_", frames: 10, fps: 10 },
  noFood: { prefix: "baby/no_food_", frames: 8, fps: 8 }
};

const roster = [
  palette("pixel-cat", "Pixel Cat", "cat", {
    base: [240, 145, 38, 255],
    light: [255, 184, 78, 255],
    shadow: [170, 82, 28, 255],
    cream: [255, 232, 178, 255],
    eye: [76, 178, 255, 255],
    aod: [112, 112, 96, 255],
    aodDim: [64, 64, 56, 255]
  }),
  palette("pixel-dog", "Pixel Dog", "dog", {
    base: [198, 132, 76, 255],
    light: [239, 184, 118, 255],
    shadow: [112, 68, 42, 255],
    cream: [255, 226, 170, 255],
    eye: [80, 170, 245, 255],
    aod: [112, 106, 92, 255],
    aodDim: [64, 60, 52, 255]
  }),
  palette("pixel-bunny", "Pixel Bunny", "bunny", {
    base: [238, 226, 210, 255],
    light: [255, 248, 230, 255],
    shadow: [174, 160, 148, 255],
    cream: [255, 236, 222, 255],
    eye: [95, 166, 255, 255],
    aod: [118, 118, 110, 255],
    aodDim: [66, 66, 62, 255]
  }),
  palette("pixel-hamster", "Pixel Hamster", "hamster", {
    base: [222, 158, 78, 255],
    light: [248, 194, 104, 255],
    shadow: [145, 88, 45, 255],
    cream: [255, 229, 170, 255],
    eye: [74, 174, 255, 255],
    aod: [116, 106, 88, 255],
    aodDim: [65, 60, 50, 255]
  }),
  palette("pixel-fox", "Pixel Fox", "fox", {
    base: [229, 96, 34, 255],
    light: [255, 148, 58, 255],
    shadow: [130, 52, 25, 255],
    cream: [255, 235, 188, 255],
    eye: [82, 184, 255, 255],
    aod: [112, 98, 88, 255],
    aodDim: [64, 54, 48, 255]
  })
];

function palette(id, name, kind, colors) {
  return {
    id,
    name,
    kind,
    colors: {
      clear: [0, 0, 0, 0],
      outline: [18, 16, 18, 255],
      white: [255, 248, 224, 255],
      pink: [245, 130, 154, 255],
      ...colors
    }
  };
}

function createGrid(colors) {
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

function ringEllipse(grid, cx, cy, rx, ry, color, clear) {
  ellipse(grid, cx, cy, rx, ry, color);
  ellipse(grid, cx, cy, Math.max(0.5, rx - 2.0), Math.max(0.5, ry - 2.0), clear);
}

function drawSparkle(grid, x, y, color) {
  rect(grid, x, y - 2, 1, 5, color);
  rect(grid, x - 2, y, 5, 1, color);
}

function drawEars(grid, pet, hx, hy, colors) {
  if (pet.kind === "bunny") {
    for (const side of [-1, 1]) {
      ellipse(grid, 32 + hx + side * 8, 12 + hy, 4.4, 13.5, colors.outline);
      ellipse(grid, 32 + hx + side * 8, 12 + hy, 2.6, 11.0, colors.light);
      ellipse(grid, 32 + hx + side * 8, 14 + hy, 1.3, 7.8, colors.pink);
    }
    return;
  }

  if (pet.kind === "dog") {
    ellipse(grid, 17 + hx, 27 + hy, 6.5, 13.5, colors.outline);
    ellipse(grid, 47 + hx, 27 + hy, 6.5, 13.5, colors.outline);
    ellipse(grid, 18 + hx, 27 + hy, 4.2, 11.0, colors.shadow);
    ellipse(grid, 46 + hx, 27 + hy, 4.2, 11.0, colors.shadow);
    ellipse(grid, 18 + hx, 20 + hy, 2.0, 3.5, colors.light);
    return;
  }

  if (pet.kind === "hamster") {
    ellipse(grid, 20 + hx, 17 + hy, 6.2, 6.2, colors.outline);
    ellipse(grid, 44 + hx, 17 + hy, 6.2, 6.2, colors.outline);
    ellipse(grid, 20 + hx, 17 + hy, 3.7, 3.7, colors.pink);
    ellipse(grid, 44 + hx, 17 + hy, 3.7, 3.7, colors.pink);
    return;
  }

  const longEar = pet.kind === "fox";
  const tipY = longEar ? 4 : 8;
  polygon(grid, [[15 + hx, 25 + hy], [20 + hx, tipY + hy], [30 + hx, 25 + hy]], colors.outline);
  polygon(grid, [[34 + hx, 25 + hy], [44 + hx, tipY + hy], [49 + hx, 25 + hy]], colors.outline);
  polygon(grid, [[19 + hx, 23 + hy], [21 + hx, 12 + hy], [28 + hx, 23 + hy]], colors.light);
  polygon(grid, [[36 + hx, 23 + hy], [43 + hx, 12 + hy], [45 + hx, 23 + hy]], colors.light);
  polygon(grid, [[22 + hx, 21 + hy], [23 + hx, 15 + hy], [26 + hx, 21 + hy]], colors.pink);
  polygon(grid, [[38 + hx, 21 + hy], [41 + hx, 15 + hy], [42 + hx, 21 + hy]], colors.pink);
}

function drawTail(grid, pet, bodyY, tailLift, colors) {
  if (pet.kind === "bunny") {
    ellipse(grid, 51, 48 + bodyY, 6.0, 6.0, colors.outline);
    ellipse(grid, 51, 48 + bodyY, 4.0, 4.0, colors.white);
    return;
  }

  if (pet.kind === "hamster") {
    ellipse(grid, 51, 49 + bodyY, 2.8, 2.8, colors.outline);
    ellipse(grid, 51, 49 + bodyY, 1.8, 1.8, colors.pink);
    return;
  }

  if (pet.kind === "fox") {
    line(grid, 43, 45 + bodyY, 55, 34 + bodyY - tailLift, 5.5, colors.outline);
    ellipse(grid, 56, 35 + bodyY - tailLift, 8.0, 12.0, colors.outline);
    line(grid, 43, 45 + bodyY, 55, 34 + bodyY - tailLift, 3.4, colors.base);
    ellipse(grid, 56, 35 + bodyY - tailLift, 5.8, 9.5, colors.base);
    polygon(grid, [[54, 25 + bodyY - tailLift], [63, 33 + bodyY - tailLift], [56, 39 + bodyY - tailLift]], colors.white);
    return;
  }

  if (pet.kind === "cat") {
    line(grid, 44, 45 + bodyY, 55, 36 + bodyY - tailLift, 4.4, colors.outline);
    ringEllipse(grid, 56, 42 + bodyY - tailLift, 8.5, 9.0, colors.outline, colors.clear);
    line(grid, 44, 45 + bodyY, 55, 36 + bodyY - tailLift, 2.5, colors.base);
    ringEllipse(grid, 56, 42 + bodyY - tailLift, 5.4, 5.9, colors.base, colors.clear);
    return;
  }

  line(grid, 44, 45 + bodyY, 56, 37 + bodyY - tailLift, 4.0, colors.outline);
  line(grid, 44, 45 + bodyY, 56, 37 + bodyY - tailLift, 2.2, colors.light);
  ellipse(grid, 57, 37 + bodyY - tailLift, 3.4, 3.4, colors.light);
}

function drawEyes(grid, pose, hx, hy, colors) {
  if (pose.eyes === "closed") {
    rect(grid, 20 + hx, 27 + hy, 10, 2, colors.outline);
    rect(grid, 35 + hx, 27 + hy, 10, 2, colors.outline);
    return;
  }

  const height = pose.eyes === "half" ? 4 : 10;
  rect(grid, 19 + hx, 22 + hy, 11, height, colors.outline);
  rect(grid, 35 + hx, 22 + hy, 11, height, colors.outline);
  rect(grid, 21 + hx, 24 + hy, 6, Math.max(2, height - 4), colors.eye);
  rect(grid, 37 + hx, 24 + hy, 6, Math.max(2, height - 4), colors.eye);
  rect(grid, 21 + hx, 22 + hy, 4, 4, colors.white);
  rect(grid, 37 + hx, 22 + hy, 4, 4, colors.white);
  setPixel(grid, 27 + hx, 30 + hy, colors.outline);
  setPixel(grid, 43 + hx, 30 + hy, colors.outline);
}

function drawFace(grid, pet, pose, hx, hy, colors) {
  if (pet.kind === "hamster") {
    ellipse(grid, 23 + hx, 34 + hy, 7.0, 6.8, colors.cream);
    ellipse(grid, 41 + hx, 34 + hy, 7.0, 6.8, colors.cream);
  } else if (pet.kind === "fox") {
    polygon(grid, [[16 + hx, 32 + hy], [32 + hx, 43 + hy], [48 + hx, 32 + hy], [42 + hx, 41 + hy], [22 + hx, 41 + hy]], colors.cream);
  } else {
    ellipse(grid, 32 + hx, 35 + hy, 11.0, 7.0, colors.cream);
  }

  drawEyes(grid, pose, hx, hy, colors);
  setPixel(grid, 32 + hx, 33 + hy, colors.outline);
  setPixel(grid, 30 + hx, 35 + hy, colors.outline);
  setPixel(grid, 34 + hx, 35 + hy, colors.outline);

  if (pose.mouth === "happy") {
    rect(grid, 29 + hx, 38 + hy, 7, 4, colors.outline);
    rect(grid, 31 + hx, 40 + hy, 3, 2, colors.pink);
  } else if (pose.mouth === "bite") {
    rect(grid, 29 + hx, 38 + hy, 5, 4, colors.outline);
  } else {
    rect(grid, 29 + hx, 38 + hy, 2, 1, colors.outline);
    rect(grid, 34 + hx, 38 + hy, 2, 1, colors.outline);
  }

  if (pose.blush !== false) {
    rect(grid, 14 + hx, 35 + hy, 4, 2, colors.pink);
    rect(grid, 47 + hx, 35 + hy, 4, 2, colors.pink);
  }
}

function drawPet(pet, pose = {}) {
  const colors = pet.colors;
  const grid = createGrid(colors);
  const bodyY = pose.bodyY ?? 0;
  const hx = pose.headX ?? 0;
  const hy = pose.headY ?? 0;
  const tailLift = pose.tailLift ?? 0;

  drawTail(grid, pet, bodyY, tailLift, colors);

  const bodyRx = pet.kind === "hamster" ? 16.0 : 14.5;
  const bodyRy = pet.kind === "bunny" ? 14.7 : 13.2;
  ellipse(grid, 32, 48 + bodyY, bodyRx, bodyRy, colors.outline);
  ellipse(grid, 32, 47 + bodyY, bodyRx - 2.4, bodyRy - 2.0, colors.base);
  ellipse(grid, 32, 51 + bodyY, 7.5, 7.6, colors.cream);

  ellipse(grid, 20, 58 + bodyY, 5.4, 3.4, colors.outline);
  ellipse(grid, 44, 58 + bodyY, 5.4, 3.4, colors.outline);
  ellipse(grid, 20, 56 + bodyY, 3.3, 2.1, colors.cream);
  ellipse(grid, 44, 56 + bodyY, 3.3, 2.1, colors.cream);

  const pawLift = pose.pawLift ?? 0;
  ellipse(grid, 18, 46 + bodyY - pawLift, 4.4, 6.5, colors.outline);
  ellipse(grid, 46, 46 + bodyY - pawLift, 4.4, 6.5, colors.outline);
  ellipse(grid, 18, 46 + bodyY - pawLift, 2.5, 4.2, colors.light);
  ellipse(grid, 46, 46 + bodyY - pawLift, 2.5, 4.2, colors.light);

  drawEars(grid, pet, hx, hy, colors);
  const headRx = pet.kind === "hamster" ? 18.5 : 18.0;
  const headRy = pet.kind === "bunny" ? 15.2 : 16.3;
  ellipse(grid, 32 + hx, 27 + hy, headRx, headRy, colors.outline);
  ellipse(grid, 32 + hx, 27 + hy, headRx - 2.4, headRy - 2.2, colors.light);

  if (pet.kind === "cat") {
    rect(grid, 26 + hx, 12 + hy, 2, 8, colors.shadow);
    rect(grid, 32 + hx, 11 + hy, 2, 8, colors.shadow);
    rect(grid, 38 + hx, 12 + hy, 2, 8, colors.shadow);
  } else if (pet.kind === "dog") {
    ellipse(grid, 24 + hx, 22 + hy, 6.0, 4.8, colors.shadow);
  } else if (pet.kind === "hamster") {
    rect(grid, 17 + hx, 30 + hy, 4, 2, colors.shadow);
    rect(grid, 43 + hx, 30 + hy, 4, 2, colors.shadow);
  } else if (pet.kind === "fox") {
    rect(grid, 24 + hx, 13 + hy, 2, 8, colors.shadow);
    rect(grid, 40 + hx, 13 + hy, 2, 8, colors.shadow);
  }

  drawFace(grid, pet, {
    eyes: pose.eyes ?? "open",
    mouth: pose.mouth ?? "calm",
    blush: pose.blush ?? true
  }, hx, hy, colors);

  if (pose.food) {
    ellipse(grid, pose.foodX ?? 14, pose.foodY ?? 44, 4.0, 4.0, colors.cream);
    setPixel(grid, (pose.foodX ?? 14) - 2, (pose.foodY ?? 44) - 2, colors.shadow);
    setPixel(grid, pose.foodX ?? 14, (pose.foodY ?? 44) + 2, colors.outline);
  }

  if (pose.sparkle) {
    drawSparkle(grid, 11, 21, colors.white);
    drawSparkle(grid, 52, 22, colors.white);
  }

  return grid;
}

function drawAod(pet) {
  const colors = pet.colors;
  const grid = createGrid(colors);

  if (pet.kind === "bunny") {
    ellipse(grid, 24, 12, 2.2, 11.0, colors.aod);
    ellipse(grid, 40, 12, 2.2, 11.0, colors.aod);
    ellipse(grid, 51, 48, 3.5, 3.5, colors.aod);
  } else if (pet.kind === "dog") {
    ellipse(grid, 17, 27, 3.5, 10.0, colors.aod);
    ellipse(grid, 47, 27, 3.5, 10.0, colors.aod);
    line(grid, 44, 45, 56, 37, 1.6, colors.aod);
  } else if (pet.kind === "fox") {
    polygon(grid, [[15, 25], [20, 5], [30, 25]], colors.aod);
    polygon(grid, [[34, 25], [44, 5], [49, 25]], colors.aod);
    ellipse(grid, 56, 35, 5.5, 9.0, colors.aod);
  } else if (pet.kind === "cat") {
    polygon(grid, [[15, 25], [20, 8], [30, 25]], colors.aod);
    polygon(grid, [[34, 25], [44, 8], [49, 25]], colors.aod);
    ringEllipse(grid, 56, 42, 5.8, 6.2, colors.aod, colors.clear);
  } else {
    ellipse(grid, 20, 17, 4.0, 4.0, colors.aod);
    ellipse(grid, 44, 17, 4.0, 4.0, colors.aod);
    ellipse(grid, 51, 49, 2.0, 2.0, colors.aod);
  }

  ringEllipse(grid, 32, 48, 14.0, 12.8, colors.aod, colors.clear);
  ringEllipse(grid, 32, 27, 15.5, 13.0, colors.aod, colors.clear);
  rect(grid, 22, 27, 4, 4, colors.aodDim);
  rect(grid, 39, 27, 4, 4, colors.aodDim);
  setPixel(grid, 32, 34, colors.aodDim);
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

async function writeFrame(pet, name, grid) {
  await writeFile(path.join(root, pet.id, "baby", name), png(grid));
}

function manifestFor(pet) {
  return {
    schemaVersion: 1,
    id: pet.id,
    name: pet.name,
    author: "Zepp Pet Universe",
    version: "0.0.1",
    minimumApiLevel: "3.0",
    screenShapes: ["r", "s"],
    forms: {
      baby: {
        static: "baby/static.png",
        aod: "baby/aod.png",
        actions: commonActions
      }
    }
  };
}

const sequences = {
  wake: [
    { eyes: "closed", headY: 2 },
    { eyes: "half" },
    { headY: -2, bodyY: -1 },
    { headY: -2, bodyY: -1, pawLift: 4, mouth: "happy" },
    { pawLift: 2, mouth: "happy" },
    {},
    { eyes: "half" },
    {}
  ],
  tap: [
    {},
    { headX: -2 },
    { headX: -2, pawLift: 2, mouth: "happy" },
    { headX: 2 },
    { headX: 2, pawLift: 2 },
    { eyes: "half" },
    { mouth: "happy" },
    {}
  ],
  feed: [
    { food: true, foodX: 9, foodY: 48 },
    { food: true, foodX: 12, foodY: 46 },
    { food: true, foodX: 16, foodY: 43 },
    { food: true, foodX: 21, foodY: 40, headX: -2 },
    { food: true, foodX: 25, foodY: 38, headX: -2, mouth: "bite" },
    { food: true, foodX: 29, foodY: 37, mouth: "bite" },
    { mouth: "bite" },
    { mouth: "happy" },
    { mouth: "happy", bodyY: -2, pawLift: 3, sparkle: true },
    { mouth: "happy" },
    { eyes: "half" },
    {}
  ],
  happy: [
    {},
    { bodyY: -2, headY: -2, mouth: "happy" },
    { bodyY: -4, headY: -2, pawLift: 4, mouth: "happy", tailLift: 2, sparkle: true },
    { bodyY: -2, headY: -2, pawLift: 6, mouth: "happy", tailLift: 4, sparkle: true },
    { pawLift: 4, mouth: "happy" },
    { bodyY: -2, headY: -2, pawLift: 4, mouth: "happy" },
    { mouth: "happy" },
    { eyes: "half", mouth: "happy" },
    { mouth: "happy" },
    {}
  ],
  no_food: [
    {},
    { headX: -2, eyes: "half" },
    { headX: -4 },
    { headX: -2, pawLift: 2 },
    { headX: 2 },
    { headX: 4, eyes: "half" },
    { headX: 2 },
    {}
  ]
};

for (const pet of roster) {
  await mkdir(path.join(root, pet.id, "baby"), { recursive: true });
  await writeFile(
    path.join(root, pet.id, "manifest.json"),
    `${JSON.stringify(manifestFor(pet), null, 2)}\n`
  );
  await writeFrame(pet, "static.png", drawPet(pet));
  await writeFrame(pet, "aod.png", drawAod(pet));

  for (const [prefix, poses] of Object.entries(sequences)) {
    for (let index = 0; index < poses.length; index += 1) {
      await writeFrame(pet, `${prefix}_${index}.png`, drawPet(pet, poses[index]));
    }
  }
}

console.log(`created starter roster assets: ${roster.map((pet) => pet.id).join(", ")}`);
