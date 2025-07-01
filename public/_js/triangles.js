// Triangulated Water Surface Animation (Delaunay, 3D effect)
// Uses only --primary-* colors from settings.tokens.css

/*
  Triangle Density:
  - GRID_COLS/GRID_ROWS = 16/10: Fast, low detail
  - 32/20: Smoother, moderate performance cost (recommended for most modern devices)
  - 48/30 or higher: Very smooth, may be slow on low-end/mobile
  - Adjust ZOOM if you change density to keep edges filled
*/

export function createTrianglesBackground({ target = ".triangles" } = {}) {
  const PRIMARY_COLORS = [
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
  const canvas =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = canvas.offsetWidth || 384;
    canvas.height = canvas.offsetHeight || 250;
  }
  resize();
  window.addEventListener("resize", resize);
  const w = () => canvas.width;
  const h = () => canvas.height;
  // Grid settings (zoom in by oversizing the grid)
  const ZOOM = 1.15;
  const GRID_COLS = 32;
  const GRID_ROWS = 20;
  const points = [];

  // Wave base parameters
  const BASE_AMP = 8;
  const BASE_SPEED1 = 1200;
  const BASE_SPEED2 = 1700;

  // Generate grid points with jitter for Delaunay, but no padding
  for (let y = 0; y <= GRID_ROWS; y++) {
    for (let x = 0; x <= GRID_COLS; x++) {
      const px =
        (x / GRID_COLS - 0.5) * w() * ZOOM * 1.7 +
        w() / 2 +
        (x > 0 && x < GRID_COLS ? (Math.random() - 0.5) * 10 : 0);
      const py = (y / GRID_ROWS - 0.5) * h() * ZOOM + h() / 2;
      const amp = 8 + (Math.random() - 0.5) * 3;
      const speed1 = 1200 + (Math.random() - 0.5) * 200;
      const speed2 = 1700 + (Math.random() - 0.5) * 200;
      const phase1 = Math.random() * Math.PI * 2;
      const phase2 = Math.random() * Math.PI * 2;
      points.push({
        x: px,
        y: py,
        baseY: py,
        baseX: px,
        z: 0,
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
  const triangles = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const i = y * (GRID_COLS + 1) + x;
      const p0 = points[i];
      const p1 = points[i + 1];
      const p2 = points[i + GRID_COLS + 1];
      const p3 = points[i + GRID_COLS + 2];
      triangles.push([p0, p1, p2]);
      triangles.push([p1, p3, p2]);
    }
  }
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
  function animate(time) {
    for (let p of points) {
      p.z =
        Math.sin(time / p.speed1 + p.baseX * 0.04 + p.baseY * 0.06 + p.phase1) *
          p.amp +
        Math.cos(time / p.speed2 + p.baseY * 0.07 - p.baseX * 0.03 + p.phase2) *
          (p.amp * 0.7);
    }
    ctx.clearRect(0, 0, w(), h());
    for (let t of triangles) {
      const avgZ = (t[0].z + t[1].z + t[2].z) / 3;
      const colorIdxRaw = ((avgZ + 17) / 34) * (PRIMARY_COLORS.length - 1);
      const idx0 = Math.floor(colorIdxRaw);
      const idx1 = Math.min(idx0 + 1, PRIMARY_COLORS.length - 1);
      const frac = colorIdxRaw - idx0;
      const fillColor = lerpColor(
        PRIMARY_COLORS[idx0],
        PRIMARY_COLORS[idx1],
        frac
      );
      ctx.beginPath();
      ctx.moveTo(t[0].x, t[0].y + t[0].z);
      ctx.lineTo(t[1].x, t[1].y + t[1].z);
      ctx.lineTo(t[2].x, t[2].y + t[2].z);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 0.98;
      ctx.fill();
      ctx.strokeStyle = fillColor;
      ctx.globalAlpha = 0.18;
      ctx.stroke();
    }
    requestAnimationFrame(animate);
  }
  animate(0);
}

// Auto-init for default usage
if (typeof window !== "undefined") {
  createTrianglesBackground();
}
