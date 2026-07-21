import * as THREE from "three";
import { createRoofGeometry, hotspotToWorld } from "../src/three/roofGeometry.js";

const W = 2.25;
const D = 1.6;
let failures = 0;

function check(label, ok, extra = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label} ${extra}`);
}

/* Every outward face normal must point away from a point known to be
   inside the roof solid. If any triangle is wound backwards it shows
   up here as a negative dot product. */
function checkWinding(name, height, hipInset) {
  const roof = createRoofGeometry(W, D, height, hipInset);
  roof.update(height, hipInset);

  const pos = roof.surface.attributes.position.array;
  const interior = new THREE.Vector3(0, height * 0.25, 0);
  let worst = Infinity;
  let degenerate = 0;

  for (let t = 0; t < pos.length / 9; t += 1) {
    const a = new THREE.Vector3(pos[t * 9 + 0], pos[t * 9 + 1], pos[t * 9 + 2]);
    const b = new THREE.Vector3(pos[t * 9 + 3], pos[t * 9 + 4], pos[t * 9 + 5]);
    const c = new THREE.Vector3(pos[t * 9 + 6], pos[t * 9 + 7], pos[t * 9 + 8]);

    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (n.length() < 1e-6) {
      degenerate += 1;
      continue;
    }
    n.normalize();

    const centroid = a.clone().add(b).add(c).divideScalar(3);
    const dot = n.dot(centroid.clone().sub(interior).normalize());
    worst = Math.min(worst, dot);
  }

  check(
    `winding ${name.padEnd(6)}`,
    worst > 0,
    `worst dot ${worst.toFixed(3)}${degenerate ? ` (${degenerate} degenerate)` : ""}`,
  );
  return roof;
}

/* The blueprint outline is generated analytically rather than extracted
   from the surface, so it has to be proved to sit ON the surface: every
   outline vertex must coincide with a surface vertex at every shape. */
function checkOutline(name, height, hipInset) {
  const roof = createRoofGeometry(W, D, height, hipInset);
  roof.update(height, hipInset);

  const surf = roof.surface.attributes.position.array;
  const line = roof.outline.attributes.position.array;

  const surfPts = [];
  for (let i = 0; i < surf.length; i += 3) {
    surfPts.push(new THREE.Vector3(surf[i], surf[i + 1], surf[i + 2]));
  }

  let worst = 0;
  for (let i = 0; i < line.length; i += 3) {
    const p = new THREE.Vector3(line[i], line[i + 1], line[i + 2]);
    let nearest = Infinity;
    for (const s of surfPts) nearest = Math.min(nearest, p.distanceTo(s));
    worst = Math.max(worst, nearest);
  }

  check(`outline ${name.padEnd(6)}`, worst < 1e-6, `max gap to surface ${worst.toExponential(1)}`);
}

console.log("--- face winding (outward normals) ---");
checkWinding("gable", 1.35, 0);
checkWinding("hip", 1.35, 0.42);
checkWinding("flat", 0.074, 0);
checkWinding("mid", 0.7, 0.2);

console.log("\n--- blueprint outline sits on the surface ---");
checkOutline("gable", 1.35, 0);
checkOutline("hip", 1.35, 0.42);
checkOutline("flat", 0.074, 0);
checkOutline("mid", 0.7, 0.2);

/* Hotspots must land on the roof surface: the eave ring at v=0 sits at
   y=0 and |z|=D, the ridge at v=1 sits at y=height and z=0. */
console.log("\n--- hotspot placement ---");
for (const [name, height, inset] of [
  ["gable", 1.35, 0],
  ["hip", 1.35, 0.42],
]) {
  const eave = hotspotToWorld({ u: 0.3, v: 0, face: "front" }, W, D, height, inset);
  const ridge = hotspotToWorld({ u: 0.3, v: 1, face: "front" }, W, D, height, inset);
  const back = hotspotToWorld({ u: -0.5, v: 0.5, face: "back" }, W, D, height, inset);

  check(`${name} eave on eave line`, Math.abs(eave.position.y) < 1e-6 && Math.abs(eave.position.z - D) < 1e-6);
  check(`${name} ridge at ridge height`, Math.abs(ridge.position.y - height) < 1e-6 && Math.abs(ridge.position.z) < 1e-6);
  check(`${name} back face has -z`, back.position.z < 0);
  check(`${name} ridge x within ridge span`, Math.abs(ridge.position.x) <= W * (1 - inset) + 1e-6);
}

/* A hotspot must sit on the slope plane, not float above or sink below it.
   Plane through eave (y=0,z=D) and ridge (y=H,z=0): H*z + D*y = H*D */
console.log("\n--- hotspots lie on the slope plane ---");
for (const [name, height, inset] of [
  ["gable", 1.35, 0],
  ["hip", 1.35, 0.42],
  ["flat", 0.074, 0],
]) {
  let worst = 0;
  for (const v of [0, 0.25, 0.5, 0.75, 1]) {
    const { position: p } = hotspotToWorld({ u: -0.2, v, face: "front" }, W, D, height, inset);
    worst = Math.max(worst, Math.abs(height * p.z + D * p.y - height * D));
  }
  check(`${name.padEnd(6)} on plane`, worst < 1e-6, `max deviation ${worst.toExponential(1)}`);
}

console.log(`\n${failures ? `${failures} FAILURE(S)` : "all geometry checks passed"}`);
process.exit(failures ? 1 : 0);
