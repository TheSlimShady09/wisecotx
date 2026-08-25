import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { HOUSE } from "../lib/site.js";
import { createRoofGeometry, hotspotToWorld } from "./roofGeometry.js";
import { getBrickTexture, getRoofTexture, getStainTexture } from "./textures.js";

const { halfWidth: W, halfDepth: D, wallHeight: WALL, eave: EAVE } = HOUSE;
const BODY_W = W - EAVE;
const BODY_D = D - EAVE;

const BASE_Y = -0.55;
const RIDGE = 1.35;

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;
const FORWARD = new THREE.Vector3(0, 0, 1);

/* ease-out-cubic over a window of the assembly timeline */
const seg = (t, from, to) => {
  const x = clamp((t - from) / (to - from), 0, 1);
  return 1 - Math.pow(1 - x, 3);
};

/* ------------------------------------------------------------
   A solid that also carries its own drawn outline. The white
   hairline is what turns a grey box into a drawing.
   ------------------------------------------------------------ */
function Drawn({ args, position, rotation, color, map = null, roughness = 1, metalness = 0, edgeMaterial, castShadow, receiveShadow }) {
  // `args` is a fresh array literal on every render, so it cannot be the
  // dep — keying on its contents keeps the geometry stable across the
  // re-renders that hover and configurator changes cause.
  const argsKey = args.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(() => new THREE.BoxGeometry(...args), [argsKey]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry]);

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
    },
    [geometry, edges],
  );

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} castShadow={castShadow} receiveShadow={receiveShadow}>
        <meshStandardMaterial color={color} map={map || undefined} roughness={roughness} metalness={metalness} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={4} />
    </group>
  );
}

/* ------------------------------------------------------------
   Roof — two coincident meshes so a covering change crossfades
   instead of popping, plus an analytic outline that morphs with
   the surface rather than being re-extracted every frame.

   Parametric in size (halfW / halfD / ridge) and placement
   (position / rotation), so the same component drives the main
   roof and every wing roof — change the shape or the covering in
   the configurator and all of them follow.
   ------------------------------------------------------------ */
function Roof({
  pitch,
  hipInset,
  textureKind,
  roughness,
  metalness,
  tone,
  edgeMaterial,
  halfW = W,
  halfD = D,
  ridge = RIDGE,
  position,
  rotation,
}) {
  const baseRef = useRef();
  const overRef = useRef();
  const shape = useRef({ h: pitch * ridge, inset: hipInset });
  const fade = useRef({ t: 1, current: textureKind });

  const roof = useMemo(() => createRoofGeometry(halfW, halfD, pitch * ridge, hipInset), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => roof.dispose(), [roof]);

  // seed the base material once; from here on it is ours, not React's
  useEffect(() => {
    const base = baseRef.current?.material;
    if (!base) return;
    base.map = getRoofTexture(textureKind);
    base.metalness = metalness;
    base.roughness = roughness;
    base.color.setScalar(tone);
    base.needsUpdate = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fade.current.current === textureKind) return;
    fade.current.t = 0;
  }, [textureKind]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);

    shape.current.h = damp(shape.current.h, pitch * ridge, 4, step);
    shape.current.inset = damp(shape.current.inset, hipInset, 4, step);
    roof.update(shape.current.h, shape.current.inset);

    const base = baseRef.current?.material;
    const over = overRef.current?.material;
    if (!base || !over) return;

    const f = fade.current;
    if (f.t < 1) {
      f.t = Math.min(1, f.t + step / 0.55);
      over.opacity = f.t;

      if (f.t >= 1) {
        base.map = over.map;
        base.metalness = metalness;
        base.needsUpdate = true;
        over.opacity = 0;
        f.current = textureKind;
      }
    } else {
      base.metalness = damp(base.metalness, metalness, 5, step);
    }

    const k = 1 - Math.exp(-5 * step);
    for (const m of [base, over]) {
      m.roughness = damp(m.roughness, roughness, 5, step);
      m.color.r += (tone - m.color.r) * k;
      m.color.g += (tone - m.color.g) * k;
      m.color.b += (tone - m.color.b) * k;
    }
    over.metalness = metalness;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={baseRef} geometry={roof.surface} castShadow receiveShadow>
        <meshStandardMaterial flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={overRef} geometry={roof.surface} renderOrder={2}>
        <meshStandardMaterial
          map={getRoofTexture(textureKind)}
          flatShading
          side={THREE.DoubleSide}
          transparent
          opacity={0}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      <lineSegments geometry={roof.outline} material={edgeMaterial} renderOrder={4} />
    </group>
  );
}

/* ------------------------------------------------------------ */
function Marker({ spot, pitch, hipInset, label, delay = 0 }) {
  const ref = useRef();
  const ringRef = useRef();
  const clock = useRef(-delay);

  useFrame((_, dt) => {
    if (!ref.current) return;

    const { position, normal } = hotspotToWorld(spot, W, D, pitch * RIDGE, hipInset);
    ref.current.position.copy(position).addScaledVector(normal, 0.035);
    ref.current.position.y += WALL;

    // NOT lookAt(): that resolves its target in world space, and this
    // group's parent rotates. Orienting from the local normal is
    // parent-independent and correct at any house angle.
    ref.current.quaternion.setFromUnitVectors(FORWARD, normal);

    clock.current += dt;
    const wave = (Math.max(0, clock.current) % 2.2) / 2.2;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + wave * 1.9);
      ringRef.current.material.opacity = (1 - wave) * 0.75;
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={ringRef} renderOrder={5}>
        <ringGeometry args={[0.15, 0.175, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh renderOrder={5}>
        <ringGeometry args={[0.13, 0.155, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh renderOrder={5}>
        <circleGeometry args={[0.038, 20]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {label ? (
        <Html center distanceFactor={9} position={[0, 0.42, 0]} zIndexRange={[20, 0]} pointerEvents="none">
          <span className="marker-tag">{label}</span>
        </Html>
      ) : null}
    </group>
  );
}

/* ------------------------------------------------------------
   Damage marks — the one thing in this model deliberately NOT
   drawn in the clean white-outline idiom. The line drawing is the
   house as built; damage reads by breaking that convention, and by
   being the only place a warning colour appears on an otherwise
   grayscale house. Only fault hotspots carry a `kind`, so this is
   inert for every other module (Insurance's peril markers have
   none, and Construction has no hotspots at all).
   ------------------------------------------------------------ */
const DAMAGE_COLOR = "#ff5722";

function DamageMark({ spot, pitch, hipInset }) {
  const ref = useRef();
  const ringRef = useRef();
  const clock = useRef(0);
  const stain = useMemo(() => getStainTexture(), []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const { position, normal } = hotspotToWorld(spot, W, D, pitch * RIDGE, hipInset);
    ref.current.position.copy(position).addScaledVector(normal, 0.018);
    ref.current.position.y += WALL;
    ref.current.quaternion.setFromUnitVectors(FORWARD, normal);

    // a slow warning pulse, distinct from the marker's own faster ring,
    // so the damage itself keeps drawing the eye even once you've clocked it
    clock.current += dt;
    const wave = (clock.current % 1.6) / 1.6;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + wave * 0.9);
      ringRef.current.material.opacity = (1 - wave) * 0.6;
    }
  });

  let mark = null;
  let ringRadius = 0.4;

  if (spot.kind === "stain") {
    ringRadius = 0.46;
    mark = (
      <mesh renderOrder={3}>
        <planeGeometry args={[0.82, 1.02]} />
        <meshBasicMaterial map={stain} transparent opacity={1} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    );
  } else if (spot.kind === "streak") {
    ringRadius = 0.5;
    mark = (
      <mesh renderOrder={3} rotation={[0, 0, Math.PI]}>
        <planeGeometry args={[0.46, 1.5]} />
        <meshBasicMaterial map={stain} transparent opacity={1} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    );
  } else if (spot.kind === "gap") {
    ringRadius = 0.34;
    mark = (
      <>
        {/* warning rim framing the hole, so the loss reads before the eye finds the hole itself */}
        <mesh position={[0, 0, 0.002]}>
          <ringGeometry args={[0.19, 0.24, 4]} />
          <meshBasicMaterial color={DAMAGE_COLOR} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* exposed underlayment where a tile is missing */}
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[0.4, 0.29]} />
          <meshStandardMaterial color="#0d0c0a" roughness={1} flatShading />
        </mesh>
        {/* a slipped tile, knocked askew rather than gone */}
        <mesh position={[0.32, -0.17, 0.02]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.32, 0.24, 0.03]} />
          <meshStandardMaterial color="#8a8a8f" roughness={0.8} flatShading />
        </mesh>
      </>
    );
  } else if (spot.kind === "tear") {
    ringRadius = 0.52;
    mark = (
      <group position={[0, -0.08, 0]} rotation={[-0.85, 0, 0]}>
        {/* a lifted section, torn free and peeled well back off the deck */}
        <mesh position={[0, 0.22, 0.01]}>
          <boxGeometry args={[0.6, 0.44, 0.02]} />
          <meshStandardMaterial color="#141210" roughness={1} flatShading side={THREE.DoubleSide} />
        </mesh>
        {/* the raw torn edge catches the warning colour */}
        <mesh position={[0, 0.44, 0.011]}>
          <boxGeometry args={[0.6, 0.05, 0.022]} />
          <meshStandardMaterial color={DAMAGE_COLOR} roughness={0.6} flatShading />
        </mesh>
      </group>
    );
  }

  if (!mark) return null;

  return (
    <group ref={ref}>
      {/* a slow warning-coloured pulse under every damage mark */}
      <mesh ref={ringRef} renderOrder={2}>
        <ringGeometry args={[ringRadius, ringRadius * 1.08, 40]} />
        <meshBasicMaterial color={DAMAGE_COLOR} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {mark}
    </group>
  );
}

/* ------------------------------------------------------------
   Characterizing props — one telling object per module, so the
   three choices read as three different jobs, not one recoloured
   house. Drawn in the same white-line idiom as everything else.
   ------------------------------------------------------------ */

/** Construction: a scaffold cage wrapping the near two corners. */
function Scaffold() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6d6d74", roughness: 0.6, metalness: 0.4, flatShading: true }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);

  const H = WALL + 0.55;
  const posts = [
    [BODY_W + 0.16, BODY_D + 0.16],
    [-BODY_W - 0.16, BODY_D + 0.16],
    [BODY_W + 0.16, -BODY_D - 0.16],
  ];
  const rails = [0.35, 0.95, H - 0.1];

  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, H / 2, z]} material={mat}>
          <cylinderGeometry args={[0.028, 0.028, H, 6]} />
        </mesh>
      ))}
      {/* horizontal rails along the front face */}
      {rails.map((y, i) => (
        <mesh key={`f${i}`} position={[0.16, y, BODY_D + 0.16]} rotation={[0, 0, Math.PI / 2]} material={mat}>
          <cylinderGeometry args={[0.02, 0.02, BODY_W * 2 + 0.36, 6]} />
        </mesh>
      ))}
      {/* rails along the right return */}
      {rails.map((y, i) => (
        <mesh key={`r${i}`} position={[BODY_W + 0.16, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat}>
          <cylinderGeometry args={[0.02, 0.02, BODY_D * 2 + 0.36, 6]} />
        </mesh>
      ))}
      {/* a working plank */}
      <mesh position={[0.16, 0.95, BODY_D + 0.16]} castShadow>
        <boxGeometry args={[BODY_W * 2, 0.04, 0.34]} />
        <meshStandardMaterial color="#4a4a50" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** Insurance: a magnifier hovering over the roof, gently sweeping. */
function Magnifier() {
  const ref = useRef();
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current += dt;
    // hovers just above the ridge; sweep kept tight so it never leaves frame
    ref.current.position.x = Math.sin(t.current * 0.6) * 0.5;
    ref.current.position.z = Math.cos(t.current * 0.45) * 0.35;
    ref.current.position.y = WALL + 1.6 + Math.sin(t.current * 0.9) * 0.05;
  });

  return (
    <group ref={ref} position={[0, WALL + 1.6, 0]} rotation={[Math.PI * 0.32, 0, Math.PI * 0.16]}>
      {/* rim */}
      <mesh castShadow>
        <torusGeometry args={[0.34, 0.045, 10, 28]} />
        <meshStandardMaterial color="#9a9aa0" roughness={0.4} metalness={0.6} flatShading />
      </mesh>
      {/* glass */}
      <mesh>
        <circleGeometry args={[0.32, 28]} />
        <meshStandardMaterial color="#c9d2d8" roughness={0.05} metalness={0.1} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* handle */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.55, 8]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

const PROPS = { scaffold: Scaffold, magnifier: Magnifier };

/* ------------------------------------------------------------ */
export default function House({
  pitch = 1,
  hipInset = 0,
  textureKind = "shingles",
  roughness = 0.9,
  metalness = 0,
  tone = 0.6,
  targetAngle = null,
  spin = 0.12,
  hotspots = [],
  markerLabel = null,
  prop = null,
  modelScale = 1,
  complex = false,
  reducedMotion = false,
  assemble = false,
  roofOnly = false,
}) {
  const Prop = prop ? PROPS[prop] : null;
  // a complex build is two storeys, so the walls are twice as tall and
  // the roof and chimney ride up to meet them
  const bodyH = roofOnly ? 0 : complex ? WALL * 2 : WALL;
  const group = useRef();
  const bodyRef = useRef();
  const roofRef = useRef();
  const chimneyRef = useRef();
  const angle = useRef(-0.5);
  const t = useRef(assemble && !reducedMotion ? 0 : 1);

  // one material for every drawn edge in the model, so the whole
  // outline fades in as a single pen stroke
  const edgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => edgeMaterial.dispose(), [edgeMaterial]);

  // brick veneer on the walls — the metroplex cladding
  const brick = useMemo(() => getBrickTexture(), []);

  // the covering + shape controls, shared by the main roof and every
  // wing roof so they all change together in the configurator
  const roofParams = { pitch, hipInset, textureKind, roughness, metalness, tone, edgeMaterial };

  useFrame((_, dt) => {
    if (!group.current) return;
    const step = Math.min(dt, 0.05);

    /* ---- rotation ---- */
    if (targetAngle !== null) {
      angle.current = damp(angle.current, targetAngle, 3.2, step);
    } else if (!reducedMotion) {
      angle.current += spin * step;
    }
    group.current.rotation.y = angle.current;
    // a lone roof has no walls to stand on, so it rides higher in frame
    const baseY = roofOnly ? BASE_Y + 0.75 : BASE_Y;
    group.current.position.y = reducedMotion ? baseY : baseY + Math.sin(performance.now() * 0.00045) * 0.045;

    /* ---- construction sequence ----
       The drawing is struck first, then the building fills in
       underneath it: walls extrude, roof is craned on, chimney last. */
    if (t.current < 1) t.current = Math.min(1, t.current + step / 2.3);
    const p = t.current;

    edgeMaterial.opacity = 0.34 * seg(p, 0, 0.3);

    if (bodyRef.current) {
      const s = seg(p, 0.12, 0.62);
      bodyRef.current.scale.y = Math.max(0.0001, s);
    }
    if (roofRef.current) {
      const s = seg(p, 0.45, 0.92);
      roofRef.current.position.y = bodyH + (1 - s) * 2.6;
      roofRef.current.scale.setScalar(Math.max(0.0001, seg(p, 0.4, 0.7)));
    }
    if (chimneyRef.current) {
      chimneyRef.current.scale.y = Math.max(0.0001, seg(p, 0.75, 1));
    }
  });

  return (
    <group ref={group} position={[0, BASE_Y, 0]} scale={modelScale}>
      {/* the whole building below the roof — dropped when the stage is
          showing the roof on its own */}
      {roofOnly ? null : (
        <>
      {/* plinth */}
      <Drawn
        args={[BODY_W * 2.14, 0.1, BODY_D * 2.14]}
        position={[0, 0.05, 0]}
        color="#242428"
        edgeMaterial={edgeMaterial}
        receiveShadow
      />

      {/* body: walls and openings extrude upward together */}
      <group ref={bodyRef}>
        <Drawn
          args={[BODY_W * 2, bodyH, BODY_D * 2]}
          position={[0, bodyH / 2, 0]}
          color="#54545a"
          map={brick}
          roughness={0.95}
          edgeMaterial={edgeMaterial}
          castShadow
          receiveShadow
        />

        {/* foundation course — a proud darker band grounds the walls */}
        <Drawn
          args={[BODY_W * 2 + 0.07, 0.18, BODY_D * 2 + 0.07]}
          position={[0, 0.09, 0]}
          color="#28282c"
          edgeMaterial={edgeMaterial}
          receiveShadow
        />
        {/* frieze band under the eave, in the wall plane rather than
            proud of it — trim a new build would actually carry */}
        <Drawn
          args={[BODY_W * 2 + 0.02, 0.12, BODY_D * 2 + 0.02]}
          position={[0, bodyH - 0.09, 0]}
          color="#3c3c43"
          edgeMaterial={edgeMaterial}
        />

        {/* two-storey build: a floor band, an upper window row and a balcony */}
        {complex ? (
          <>
            <Drawn
              args={[BODY_W * 2 + 0.05, 0.07, BODY_D * 2 + 0.05]}
              position={[0, WALL, 0]}
              color="#3f3f45"
              edgeMaterial={edgeMaterial}
            />

            {[
              [-1.15, WALL + 0.86, BODY_D + 0.005, 0],
              [1.15, WALL + 0.86, BODY_D + 0.005, 0],
              [BODY_W + 0.005, WALL + 0.86, 0.45, Math.PI / 2],
              [BODY_W + 0.005, WALL + 0.86, -0.55, Math.PI / 2],
              [-BODY_W - 0.005, WALL + 0.86, 0, Math.PI / 2],
            ].map(([x, y, z, ry], i) => (
              <group key={`u${i}`} position={[x, y, z]} rotation={[0, ry, 0]}>
                <Drawn args={[0.56, 0.6, 0.05]} position={[0, 0, 0]} color="#4c4c52" edgeMaterial={edgeMaterial} />
                <mesh position={[0, 0, 0.035]}>
                  <boxGeometry args={[0.44, 0.48, 0.03]} />
                  <meshStandardMaterial color="#101011" roughness={0.72} metalness={0.08} flatShading />
                </mesh>
                <mesh position={[0, 0, 0.055]}>
                  <boxGeometry args={[0.028, 0.48, 0.01]} />
                  <meshStandardMaterial color="#54545a" roughness={0.9} flatShading />
                </mesh>
                <Drawn args={[0.66, 0.06, 0.1]} position={[0, -0.36, 0.03]} color="#4a4a50" edgeMaterial={edgeMaterial} />
              </group>
            ))}

            {/* balcony over the entrance, with a simple railing */}
            <group position={[-0.55, WALL + 0.05, BODY_D + 0.24]}>
              <Drawn args={[1.2, 0.07, 0.48]} position={[0, 0, 0]} color="#33333a" edgeMaterial={edgeMaterial} castShadow />
              <Drawn args={[1.2, 0.42, 0.04]} position={[0, 0.24, 0.22]} color="#3d3d43" edgeMaterial={edgeMaterial} />
              {[-0.58, -0.29, 0, 0.29, 0.58].map((x) => (
                <mesh key={x} position={[x, 0.24, 0.22]}>
                  <boxGeometry args={[0.03, 0.42, 0.03]} />
                  <meshStandardMaterial color="#55555b" roughness={0.7} flatShading />
                </mesh>
              ))}
            </group>
          </>
        ) : null}

        {/* door: reveal, leaf, handle, a step and a small canopy */}
        <Drawn args={[0.68, 1.26, 0.05]} position={[-0.55, 0.63, BODY_D + 0.005]} color="#232328" edgeMaterial={edgeMaterial} />
        <mesh position={[-0.55, 0.61, BODY_D + 0.04]}>
          <boxGeometry args={[0.52, 1.16, 0.04]} />
          <meshStandardMaterial color="#141417" roughness={0.6} flatShading />
        </mesh>
        {/* a long vertical pull instead of a knob */}
        <mesh position={[-0.35, 0.61, BODY_D + 0.07]}>
          <boxGeometry args={[0.03, 0.46, 0.03]} />
          <meshStandardMaterial color="#9a9aa0" roughness={0.3} metalness={0.72} flatShading />
        </mesh>
        {/* glass sidelight next to the door */}
        <Drawn args={[0.17, 1.26, 0.04]} position={[-0.14, 0.63, BODY_D + 0.005]} color="#232328" edgeMaterial={edgeMaterial} />
        <mesh position={[-0.14, 0.63, BODY_D + 0.035]}>
          <boxGeometry args={[0.1, 1.16, 0.03]} />
          <meshStandardMaterial color="#0d0d10" roughness={0.4} metalness={0.2} flatShading />
        </mesh>
        {/* covered entry: two square brick piers carrying a flat porch
            roof, tucked under the main eave */}
        <group position={[-0.9, 0, 0]}>
          <Drawn args={[1.9, 0.12, 0.92]} position={[0, 0.06, BODY_D + 0.46]} color="#3a3a41" edgeMaterial={edgeMaterial} receiveShadow />
          <Drawn args={[1.1, 0.05, 0.24]} position={[0.35, 0.03, BODY_D + 1.03]} color="#34343a" edgeMaterial={edgeMaterial} />
          {[-0.82, 0.82].map((x) => (
            <group key={x}>
              <Drawn
                args={[0.2, 1.18, 0.2]}
                position={[x, 0.71, BODY_D + 0.82]}
                color="#4e4e55"
                map={brick}
                edgeMaterial={edgeMaterial}
                castShadow
              />
              {/* cast stone cap on each pier */}
              <Drawn args={[0.26, 0.06, 0.26]} position={[x, 1.33, BODY_D + 0.82]} color="#5c5c62" edgeMaterial={edgeMaterial} />
            </group>
          ))}
          {/* the porch roof: flat, thin-edged, running back to the wall */}
          <Drawn args={[2.06, 0.09, 1.06]} position={[0, 1.4, BODY_D + 0.47]} color="#3f3f46" edgeMaterial={edgeMaterial} castShadow />
          <Drawn args={[2.06, 0.12, 0.06]} position={[0, 1.33, BODY_D + 0.97]} color="#33333a" edgeMaterial={edgeMaterial} />
        </group>

        {/* windows: tall black-framed openings with one transom bar — the
            new-build read is glass area and a dark frame, not muntins */}
        {[
          [0.62, 0.95, BODY_D + 0.005, 0],
          [1.5, 0.95, BODY_D + 0.005, 0],
          [BODY_W + 0.005, 0.95, 0.45, Math.PI / 2],
          [-BODY_W - 0.005, 0.95, -0.4, Math.PI / 2],
        ].map(([x, y, z, ry], i) => (
          <group key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
            {/* a dark frame band, proud of the brick */}
            <Drawn args={[0.74, 1.2, 0.05]} position={[0, 0, 0]} color="#232328" edgeMaterial={edgeMaterial} />
            <mesh position={[0, 0, 0.035]}>
              <boxGeometry args={[0.64, 1.1, 0.03]} />
              <meshStandardMaterial color="#0d0d10" roughness={0.4} metalness={0.2} flatShading />
            </mesh>
            <mesh position={[0, 0.3, 0.055]}>
              <boxGeometry args={[0.64, 0.03, 0.012]} />
              <meshStandardMaterial color="#3a3a40" roughness={0.85} flatShading />
            </mesh>
            {/* cast stone sill and header, the trim a brick wall actually needs */}
            <Drawn args={[0.86, 0.07, 0.12]} position={[0, -0.64, 0.04]} color="#5c5c62" edgeMaterial={edgeMaterial} />
            <Drawn args={[0.86, 0.07, 0.09]} position={[0, 0.64, 0.03]} color="#57575d" edgeMaterial={edgeMaterial} />
          </group>
        ))}

        {/* garage wing: a single-storey mass on the right with its own
            gabled roof (editable) and a wide door */}
        {complex ? (
          <group position={[BODY_W + 0.9, 0, 0]}>
            <Drawn args={[1.8, 1.15, BODY_D * 1.5]} position={[0, 0.575, 0]} color="#515157" map={brick} edgeMaterial={edgeMaterial} castShadow receiveShadow />
            {/* ridge runs along the garage depth; morphs and re-covers with the rest */}
            <Roof {...roofParams} halfW={BODY_D * 0.82} halfD={0.94} ridge={0.5} position={[0, 1.15, 0]} rotation={[0, Math.PI / 2, 0]} />
            {/* garage door */}
            <Drawn args={[1.46, 0.94, 0.05]} position={[0, 0.5, BODY_D * 0.75 + 0.01]} color="#232328" edgeMaterial={edgeMaterial} />
            <mesh position={[0, 0.5, BODY_D * 0.75 + 0.035]}>
              <boxGeometry args={[1.34, 0.84, 0.03]} />
              <meshStandardMaterial color="#16161a" roughness={0.65} flatShading />
            </mesh>
            {/* sectional panel lines, and a row of lights in the top panel */}
            {[-0.28, 0, 0.28].map((y) => (
              <mesh key={y} position={[0, 0.5 + y, BODY_D * 0.75 + 0.055]}>
                <boxGeometry args={[1.34, 0.02, 0.01]} />
                <meshStandardMaterial color="#3a3a40" roughness={0.9} flatShading />
              </mesh>
            ))}
            {[-0.45, -0.15, 0.15, 0.45].map((x) => (
              <mesh key={`gl${x}`} position={[x, 0.86, BODY_D * 0.75 + 0.055]}>
                <boxGeometry args={[0.24, 0.14, 0.01]} />
                <meshStandardMaterial color="#0d0d10" roughness={0.35} metalness={0.25} flatShading />
              </mesh>
            ))}
          </group>
        ) : null}

        {/* left wing — single storey with its own editable gabled roof */}
        {complex ? (
          <group position={[-(BODY_W + 0.85), 0, 0]}>
            <Drawn args={[1.7, 1.35, BODY_D * 1.5]} position={[0, 0.675, 0]} color="#54545a" map={brick} edgeMaterial={edgeMaterial} castShadow receiveShadow />
            <Roof {...roofParams} halfW={BODY_D * 0.78} halfD={0.92} ridge={0.62} position={[0, 1.35, 0]} rotation={[0, Math.PI / 2, 0]} />
            {/* a window on the street-facing gable end */}
            <Drawn args={[0.5, 0.62, 0.05]} position={[-0.85 - 0.02, 0.78, 0.3]} rotation={[0, -Math.PI / 2, 0]} color="#4c4c52" edgeMaterial={edgeMaterial} />
            <mesh position={[-0.85 - 0.05, 0.78, 0.3]} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[0.38, 0.5, 0.03]} />
              <meshStandardMaterial color="#101011" roughness={0.72} metalness={0.08} flatShading />
            </mesh>
          </group>
        ) : null}

        {/* rear wing — a back ell with its own editable gabled roof */}
        {complex ? (
          <group position={[0.5, 0, -(BODY_D + 0.75)]}>
            <Drawn args={[1.5, 1.55, 1.5]} position={[0, 0.775, 0]} color="#525258" map={brick} edgeMaterial={edgeMaterial} castShadow receiveShadow />
            <Roof {...roofParams} halfW={0.82} halfD={0.82} ridge={0.6} position={[0, 1.55, 0]} />
            {/* rear window */}
            <Drawn args={[0.52, 0.6, 0.05]} position={[0, 0.85, -0.75 - 0.02]} color="#4c4c52" edgeMaterial={edgeMaterial} />
            <mesh position={[0, 0.85, -0.75 - 0.05]}>
              <boxGeometry args={[0.4, 0.48, 0.03]} />
              <meshStandardMaterial color="#101011" roughness={0.72} metalness={0.08} flatShading />
            </mesh>
          </group>
        ) : null}
      </group>
        </>
      )}

      {/* roof, craned into place */}
      <group ref={roofRef} position={[0, bodyH, 0]}>
        {/* soffit — a boxed underside on all four sides, which is what
            gives a new build its deep, shaded eave */}
        <Drawn args={[W * 2 + 0.05, 0.04, 0.34]} position={[0, -0.06, D - 0.16]} color="#2a2a30" edgeMaterial={edgeMaterial} />
        <Drawn args={[W * 2 + 0.05, 0.04, 0.34]} position={[0, -0.06, -D + 0.16]} color="#2a2a30" edgeMaterial={edgeMaterial} />
        <Drawn args={[0.34, 0.04, D * 2 - 0.32]} position={[W - 0.16, -0.06, 0]} color="#2a2a30" edgeMaterial={edgeMaterial} />
        <Drawn args={[0.34, 0.04, D * 2 - 0.32]} position={[-W + 0.16, -0.06, 0]} color="#2a2a30" edgeMaterial={edgeMaterial} />

        {/* eave fascia — a hairline band ringing the roof foot, so the
            covering reads as sitting on a built edge, not floating */}
        <Drawn args={[W * 2 + 0.05, 0.08, 0.06]} position={[0, -0.02, D]} color="#33333a" edgeMaterial={edgeMaterial} />
        <Drawn args={[W * 2 + 0.05, 0.08, 0.06]} position={[0, -0.02, -D]} color="#33333a" edgeMaterial={edgeMaterial} />
        <Drawn args={[0.06, 0.08, D * 2]} position={[W, -0.02, 0]} color="#33333a" edgeMaterial={edgeMaterial} />
        <Drawn args={[0.06, 0.08, D * 2]} position={[-W, -0.02, 0]} color="#33333a" edgeMaterial={edgeMaterial} />

        <Roof {...roofParams} />
      </group>

      {/* chimney: a brick stack with a flat metal shroud */}
      <group ref={chimneyRef} position={[0, bodyH - 0.15, 0]} visible={!roofOnly}>
        <Drawn args={[0.36, 1.5, 0.36]} position={[1.15, 0.75, -0.28]} color="#4e4e55" map={brick} edgeMaterial={edgeMaterial} castShadow />
        <Drawn args={[0.48, 0.08, 0.48]} position={[1.15, 1.58, -0.28]} color="#3d3d44" edgeMaterial={edgeMaterial} castShadow />
        {/* a flat metal shroud, the way a new build tops a brick flue */}
        <Drawn args={[0.42, 0.16, 0.42]} position={[1.15, 1.7, -0.28]} color="#5e5e66" metalness={0.55} roughness={0.45} edgeMaterial={edgeMaterial} castShadow />
      </group>

      {Prop ? <Prop /> : null}

      {hotspots.map((spot, i) => (
        <Marker
          key={`${spot.face}-${spot.u}-${spot.v}-${i}`}
          spot={spot}
          pitch={pitch}
          hipInset={hipInset}
          label={i === 0 ? markerLabel : null}
          delay={i * 0.45}
        />
      ))}

      {hotspots.map((spot, i) =>
        spot.kind ? (
          <DamageMark key={`dmg-${spot.face}-${spot.u}-${spot.v}-${i}`} spot={spot} pitch={pitch} hipInset={hipInset} />
        ) : null,
      )}
    </group>
  );
}
