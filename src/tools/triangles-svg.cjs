const fs = require("fs");

const WIDTH = 300;
const HEIGHT = 200;
const GRID_COLS = 20;
const GRID_ROWS = 10;
const JITTER = 10;
const COLORS = [
  "#bae6fd",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#075985",
  "#0c4a6e",
  "#082f49",
];

// Helper: interpolate between two hex colors
function lerpColor(a, b, t) {
  const ah = a.startsWith("#") ? a.slice(1) : a;
  const bh = b.startsWith("#") ? b.slice(1) : b;
  const ar = parseInt(ah.substring(0, 2), 16);
  const ag = parseInt(ah.substring(2, 4), 16);
  const ab = parseInt(ah.substring(4, 6), 16);
  const br = parseInt(bh.substring(0, 2), 16);
  const bg = parseInt(bh.substring(2, 4), 16);
  const bb = parseInt(bh.substring(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b_ = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
}

function randomGrid(seed = 0, time = 0) {
  // Simple seeded random
  let s = seed;
  function rand() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }
  // Generate grid points with per-point wave params
  const points = [];
  for (let y = 0; y <= GRID_ROWS; y++) {
    for (let x = 0; x <= GRID_COLS; x++) {
      let px = (x / GRID_COLS) * WIDTH;
      let py = (y / GRID_ROWS) * HEIGHT;
      // Jitter except on edges
      if (x > 0 && x < GRID_COLS && y > 0 && y < GRID_ROWS) {
        px += (rand() - 0.5) * JITTER;
        py += (rand() - 0.5) * JITTER;
      }
      // Per-point wave params (match canvas script)
      const amp = 8 + (rand() - 0.5) * 3;
      const speed1 = 1200 + (rand() - 0.5) * 200;
      const speed2 = 1700 + (rand() - 0.5) * 200;
      const phase1 = rand() * Math.PI * 2;
      const phase2 = rand() * Math.PI * 2;
      points.push({
        x: px,
        y: py,
        col: x,
        row: y,
        amp,
        speed1,
        speed2,
        phase1,
        phase2,
      });
    }
  }
  return points;
}

function triangulate(points) {
  const tris = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const i = y * (GRID_COLS + 1) + x;
      const p0 = points[i];
      const p1 = points[i + 1];
      const p2 = points[i + GRID_COLS + 1];
      const p3 = points[i + GRID_COLS + 2];
      tris.push([p0, p1, p2]);
      tris.push([p1, p3, p2]);
    }
  }
  return tris;
}

function colorForTri(tri, time = 0) {
  // Use the average z (wave height) for the triangle, as in the canvas script
  function z(p) {
    return (
      Math.sin(time / p.speed1 + p.x * 0.04 + p.y * 0.06 + p.phase1) * p.amp +
      Math.cos(time / p.speed2 + p.y * 0.07 - p.x * 0.03 + p.phase2) *
        (p.amp * 0.7)
    );
  }
  const avgZ = (z(tri[0]) + z(tri[1]) + z(tri[2])) / 3;
  // Map avgZ to color index (match canvas script)
  const colorIdxRaw = ((avgZ + 17) / 34) * (COLORS.length - 1);
  const idx0 = Math.floor(colorIdxRaw);
  const idx1 = Math.min(idx0 + 1, COLORS.length - 1);
  const frac = colorIdxRaw - idx0;
  return lerpColor(COLORS[idx0], COLORS[idx1], frac);
}

function makeSVG(seed = 0) {
  const time = seed * 1000 + 1234; // pseudo-random time per seed
  const points = randomGrid(seed, time);
  const tris = triangulate(points);
  let svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">\n`;
  for (const tri of tris) {
    const color = colorForTri(tri, time);
    svg += `<polygon points="${tri
      .map((p) => `${parseFloat(p.x.toFixed(1))},${parseFloat(p.y.toFixed(1))}`)
      .join(" ")}" fill="${color}"/>\n`;
  }
  svg += "</svg>\n";
  return svg;
}

// Write 3 SVGs with different random seeds and unique filenames
for (let i = 1; i <= 3; i++) {
  const seed = Math.floor(Math.random() * 1e9);
  const svg = makeSVG(seed);
  const fname = `triangle-${seed}.svg`;
  fs.writeFileSync(__dirname + `/../assets/images/${fname}`, svg);
  console.log(`${fname} written to assets/images/triangles-${seed}.svg`);
}
