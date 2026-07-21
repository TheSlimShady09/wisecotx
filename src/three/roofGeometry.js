import * as THREE from "three";

/* ============================================================
   One roof, three shapes.

   Gable, hip and flat are not three models — they are three
   points in the same two-parameter space, so the configurator
   can lerp between them and the roof genuinely morphs.

       height    ridge height above the eave line
       hipInset  0   -> ridge spans the full width  (gable, and
                        the end faces become the gable walls)
                 0.4 -> ridge pulled in            (hip, and the
                        same end faces become hip slopes)
       height~0  -> flat

   Six vertices, eight triangles, non-indexed so
   computeVertexNormals() gives us flat shading for free.
   ============================================================ */

const TRIS = [
  // back slope (-Z)
  [0, 5, 1],
  [0, 4, 5],
  // front slope (+Z)
  [3, 2, 5],
  [3, 5, 4],
  // +X end — hip slope when inset, gable wall when not
  [1, 5, 2],
  // -X end
  [0, 3, 4],
  // underside, visible under the eave overhang
  [0, 1, 2],
  [0, 2, 3],
];

/* The nine edges of the roof solid, for the blueprint line overlay.
   Derived from the same six corners, so the outline morphs in exact
   lockstep with the surface instead of being re-extracted per frame. */
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0], // eave line
  [4, 5], // ridge
  [0, 4],
  [1, 5],
  [2, 5],
  [3, 4], // rakes / hips
];

const VERT_COUNT = TRIS.length * 3;
const EDGE_VERT_COUNT = EDGES.length * 2;

/**
 * Writes the six corner points for the current parameters.
 * @returns {THREE.Vector3[]}
 */
function corners(halfWidth, halfDepth, height, hipInset) {
  const W = halfWidth;
  const D = halfDepth;
  const H = height;
  const Rx = W * (1 - hipInset);

  return [
    new THREE.Vector3(-W, 0, -D), // 0
    new THREE.Vector3(W, 0, -D), // 1
    new THREE.Vector3(W, 0, D), // 2
    new THREE.Vector3(-W, 0, D), // 3
    new THREE.Vector3(-Rx, H, 0), // 4
    new THREE.Vector3(Rx, H, 0), // 5
  ];
}

/** UV in world units; density is controlled by texture.repeat. */
function uvFor(index, p, halfWidth, halfDepth, height, hipInset) {
  const W = halfWidth;
  const slopeRun = Math.hypot(halfDepth, height);
  const endRun = Math.hypot(W * hipInset, height);

  // ridge vertices sit at the top of whichever face we are on
  const onRidge = index === 4 || index === 5;

  if (index === 0 || index === 1 || index === 2 || index === 3) {
    return [p.x + W, 0];
  }
  return [p.x + W, onRidge ? slopeRun : endRun];
}

/**
 * Builds the roof surface and its matching outline. Call `update`
 * each frame with new parameters — it rewrites both buffers in
 * place, no reallocation.
 *
 * @returns {{surface: THREE.BufferGeometry, outline: THREE.BufferGeometry, update: Function, dispose: Function}}
 */
export function createRoofGeometry(halfWidth, halfDepth, height, hipInset) {
  const surface = new THREE.BufferGeometry();
  const positions = new Float32Array(VERT_COUNT * 3);
  const uvs = new Float32Array(VERT_COUNT * 2);
  surface.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  surface.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  const outline = new THREE.BufferGeometry();
  const linePositions = new Float32Array(EDGE_VERT_COUNT * 3);
  outline.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

  const update = (h, inset, w = halfWidth, d = halfDepth) => {
    const pts = corners(w, d, h, inset);
    let vi = 0;

    for (const tri of TRIS) {
      for (const index of tri) {
        const p = pts[index];
        positions[vi * 3 + 0] = p.x;
        positions[vi * 3 + 1] = p.y;
        positions[vi * 3 + 2] = p.z;

        const [u, v] = uvFor(index, p, w, d, h, inset);
        uvs[vi * 2 + 0] = u;
        uvs[vi * 2 + 1] = v;
        vi += 1;
      }
    }

    let li = 0;
    for (const [a, b] of EDGES) {
      for (const index of [a, b]) {
        const p = pts[index];
        linePositions[li * 3 + 0] = p.x;
        linePositions[li * 3 + 1] = p.y;
        linePositions[li * 3 + 2] = p.z;
        li += 1;
      }
    }

    surface.attributes.position.needsUpdate = true;
    surface.attributes.uv.needsUpdate = true;
    surface.computeVertexNormals(); // non-indexed => flat shaded
    surface.computeBoundingSphere();

    outline.attributes.position.needsUpdate = true;
    outline.computeBoundingSphere();
  };

  update(height, hipInset);

  return {
    surface,
    outline,
    update,
    dispose: () => {
      surface.dispose();
      outline.dispose();
    },
  };
}

/**
 * Maps a normalised hotspot (u across the ridge, v up the slope,
 * face front/back) to a world position and a surface normal, so
 * repair markers stay glued to the roof as it morphs.
 */
export function hotspotToWorld({ u, v, face }, halfWidth, halfDepth, height, hipInset) {
  const W = halfWidth;
  const D = halfDepth;
  const Rx = W * (1 - hipInset);

  const sign = face === "back" ? -1 : 1;
  // ridge x is clamped to the ridge segment so points near the ends
  // ride up onto the hip rather than floating off it
  const eaveX = u * W;
  const ridgeX = THREE.MathUtils.clamp(u * W, -Rx, Rx);

  const x = THREE.MathUtils.lerp(eaveX, ridgeX, v);
  const y = v * height;
  const z = sign * D * (1 - v);

  const normal = new THREE.Vector3(0, D, sign * height).normalize();
  return { position: new THREE.Vector3(x, y, z), normal };
}
