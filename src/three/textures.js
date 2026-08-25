import * as THREE from "three";

/* ============================================================
   Roof coverings drawn procedurally into a canvas — no .glb, no
   image downloads, and the whole palette stays grayscale by
   construction. Each texture is a light/dark modulation that the
   material's own colour multiplies, so tone stays in the tokens.
   ============================================================ */

const SIZE = 256;
const cache = new Map();

function canvas2d() {
  const el = document.createElement("canvas");
  el.width = SIZE;
  el.height = SIZE;
  return { el, ctx: el.getContext("2d") };
}

/** Interlocking clay tile: overlapping scalloped courses. */
function drawTiles(ctx) {
  ctx.fillStyle = "#b4b4b4";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const rows = 8;
  const cols = 8;
  const h = SIZE / rows;
  const w = SIZE / cols;

  for (let r = 0; r < rows; r += 1) {
    const y = r * h;
    // shadow cast by the course above
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, "rgba(0,0,0,0.34)");
    grad.addColorStop(0.35, "rgba(0,0,0,0.04)");
    grad.addColorStop(1, "rgba(255,255,255,0.10)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, SIZE, h);

    const offset = r % 2 ? w / 2 : 0;
    for (let c = -1; c <= cols; c += 1) {
      const x = c * w + offset;
      // barrel of each pan
      const barrel = ctx.createLinearGradient(x, 0, x + w, 0);
      barrel.addColorStop(0, "rgba(0,0,0,0.22)");
      barrel.addColorStop(0.45, "rgba(255,255,255,0.14)");
      barrel.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = barrel;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + h * 0.45);
      ctx.quadraticCurveTo(x + w / 2, y - h * 0.15, x + w, y + h * 0.45);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

/** Standing seam: vertical raised ribs running up the slope. */
function drawMetal(ctx) {
  ctx.fillStyle = "#cfcfcf";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const bays = 6;
  const w = SIZE / bays;

  for (let i = 0; i < bays; i += 1) {
    const x = i * w;
    // slight pan crown between the seams
    const pan = ctx.createLinearGradient(x, 0, x + w, 0);
    pan.addColorStop(0, "rgba(0,0,0,0.16)");
    pan.addColorStop(0.5, "rgba(255,255,255,0.12)");
    pan.addColorStop(1, "rgba(0,0,0,0.16)");
    ctx.fillStyle = pan;
    ctx.fillRect(x, 0, w, SIZE);

    // the seam itself
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(x - 2, 0, 4, SIZE);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x - 2, 0, 1.5, SIZE);
  }
}

/** Laminated shingle: staggered tabs with a randomised granule tone. */
function drawShingles(ctx) {
  ctx.fillStyle = "#9a9a9a";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const rows = 10;
  const h = SIZE / rows;
  const tab = SIZE / 5;

  for (let r = 0; r < rows; r += 1) {
    const y = r * h;
    const offset = (r % 2 ? tab / 2 : 0) + (r % 3) * 4;

    for (let c = -1; c <= 5; c += 1) {
      const x = c * tab + offset;
      // each tab gets its own granule value — reads as texture at distance
      const v = 0.5 + (((r * 7 + c * 13) % 9) / 9) * 0.5;
      ctx.fillStyle = `rgba(${v * 190},${v * 190},${v * 190},1)`;
      ctx.fillRect(x, y, tab - 2, h - 1);

      // keyway shadow under the butt edge
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.fillRect(x, y + h - 3, tab - 2, 3);
      ctx.fillRect(x + tab - 2, y, 2, h);
    }
  }

  // granule speckle
  for (let i = 0; i < 2600; i += 1) {
    const a = Math.random() * 0.16;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1.5, 1.5);
  }
}

const PAINTERS = { tiles: drawTiles, metal: drawMetal, shingles: drawShingles };

/**
 * @param {"tiles"|"metal"|"shingles"} kind
 * @returns {THREE.CanvasTexture}
 */
export function getRoofTexture(kind) {
  if (cache.has(kind)) return cache.get(kind);

  const { el, ctx } = canvas2d();
  (PAINTERS[kind] ?? drawShingles)(ctx);

  const texture = new THREE.CanvasTexture(el);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // uv is in world units, so repeat sets real-world tile size
  texture.repeat.set(kind === "metal" ? 0.55 : 0.85, kind === "metal" ? 0.55 : 0.85);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;

  cache.set(kind, texture);
  return texture;
}

/** Running-bond brick: staggered courses with a raked mortar joint. */
function drawBrick(ctx) {
  ctx.fillStyle = "#a8a8a8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const rows = 16;
  const cols = 6;
  const h = SIZE / rows;
  const w = SIZE / cols;

  for (let r = 0; r < rows; r += 1) {
    const y = r * h;
    const offset = r % 2 ? w / 2 : 0;

    for (let c = -1; c <= cols; c += 1) {
      const x = c * w + offset;
      // every brick gets its own value, which is what stops the wall
      // reading as a printed pattern at distance
      const v = 0.72 + (((r * 5 + c * 11) % 7) / 7) * 0.28;
      ctx.fillStyle = `rgba(${v * 205},${v * 200},${v * 196},1)`;
      ctx.fillRect(x + 1.5, y + 1.5, w - 3, h - 3);
    }

    // the raked bed joint, darker than the head joints
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(0, y + h - 1.5, SIZE, 1.5);
  }
}

/**
 * Brick veneer for the walls — the cladding almost every new build in
 * the metroplex carries, drawn in the same grayscale modulation as the
 * roof coverings so the palette stays in the tokens.
 * @returns {THREE.CanvasTexture}
 */
export function getBrickTexture() {
  const key = "__brick";
  if (cache.has(key)) return cache.get(key);

  const { el, ctx } = canvas2d();
  drawBrick(ctx);

  const texture = new THREE.CanvasTexture(el);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;

  cache.set(key, texture);
  return texture;
}

/** Water stain: a soft dark bloom with a couple of drip trails. */
function drawStain(ctx) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const bloom = ctx.createRadialGradient(SIZE * 0.5, SIZE * 0.42, 0, SIZE * 0.5, SIZE * 0.42, SIZE * 0.46);
  bloom.addColorStop(0, "rgba(18,16,12,0.82)");
  bloom.addColorStop(0.5, "rgba(18,16,12,0.42)");
  bloom.addColorStop(0.8, "rgba(18,16,12,0.14)");
  bloom.addColorStop(1, "rgba(18,16,12,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const drips = [0.42, 0.5, 0.58];
  for (const x of drips) {
    const drip = ctx.createLinearGradient(0, SIZE * 0.4, 0, SIZE);
    drip.addColorStop(0, "rgba(18,16,12,0.5)");
    drip.addColorStop(1, "rgba(18,16,12,0)");
    ctx.fillStyle = drip;
    ctx.fillRect(SIZE * x - 4, SIZE * 0.4, 8, SIZE * 0.6);
  }
}

/**
 * A transparent decal texture for damage marks (water stains, streaks) —
 * blended over the roof covering rather than replacing it.
 * @returns {THREE.CanvasTexture}
 */
export function getStainTexture() {
  const key = "__stain";
  if (cache.has(key)) return cache.get(key);

  const { el, ctx } = canvas2d();
  drawStain(ctx);

  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;

  cache.set(key, texture);
  return texture;
}

export function disposeRoofTextures() {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
}
