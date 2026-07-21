import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import { HOUSE } from "../lib/site.js";
import { createRoofGeometry, hotspotToWorld } from "./roofGeometry.js";
import { getRoofTexture } from "./textures.js";

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
function Drawn({ args, position, rotation, color, roughness = 1, metalness = 0, edgeMaterial, castShadow, receiveShadow }) {
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
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} flatShading />
      </mesh>
      <lineSegments geometry={edges} material={edgeMaterial} renderOrder={4} />
    </group>
  );
}

/* ------------------------------------------------------------
   Roof — two coincident meshes so a covering change crossfades
   instead of popping, plus an analytic outline that morphs with
   the surface rather than being re-extracted every frame.
   ------------------------------------------------------------ */
function Roof({ pitch, hipInset, textureKind, roughness, metalness, tone, edgeMaterial }) {
  const baseRef = useRef();
  const overRef = useRef();
  const shape = useRef({ h: pitch * RIDGE, inset: hipInset });
  const fade = useRef({ t: 1, current: textureKind });

  const roof = useMemo(() => createRoofGeometry(W, D, pitch * RIDGE, hipInset), []); // eslint-disable-line react-hooks/exhaustive-deps
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

    shape.current.h = damp(shape.current.h, pitch * RIDGE, 4, step);
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
    <>
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
    </>
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
  reducedMotion = false,
  assemble = false,
}) {
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
    group.current.position.y = reducedMotion ? BASE_Y : BASE_Y + Math.sin(performance.now() * 0.00045) * 0.045;

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
      roofRef.current.position.y = WALL + (1 - s) * 2.6;
      roofRef.current.scale.setScalar(Math.max(0.0001, seg(p, 0.4, 0.7)));
    }
    if (chimneyRef.current) {
      chimneyRef.current.scale.y = Math.max(0.0001, seg(p, 0.75, 1));
    }
  });

  return (
    <group ref={group} position={[0, BASE_Y, 0]}>
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
          args={[BODY_W * 2, WALL, BODY_D * 2]}
          position={[0, WALL / 2, 0]}
          color="#3a3a3e"
          roughness={0.95}
          edgeMaterial={edgeMaterial}
          castShadow
          receiveShadow
        />

        {/* door, with a reveal around it */}
        <Drawn args={[0.56, 0.98, 0.05]} position={[-0.55, 0.49, BODY_D + 0.005]} color="#2a2a2e" edgeMaterial={edgeMaterial} />
        <mesh position={[-0.55, 0.44, BODY_D + 0.04]}>
          <boxGeometry args={[0.42, 0.86, 0.04]} />
          <meshStandardMaterial color="#141417" roughness={0.8} flatShading />
        </mesh>

        {/* windows: a lighter reveal, then a dark glazed pane */}
        {[
          [0.52, 0.86, BODY_D + 0.005, 0],
          [1.3, 0.86, BODY_D + 0.005, 0],
          [BODY_W + 0.005, 0.86, 0.45, Math.PI / 2],
          [-BODY_W - 0.005, 0.86, -0.4, Math.PI / 2],
        ].map(([x, y, z, ry], i) => (
          <group key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
            <Drawn args={[0.56, 0.62, 0.05]} position={[0, 0, 0]} color="#4a4a50" edgeMaterial={edgeMaterial} />
            <mesh position={[0, 0, 0.035]}>
              <boxGeometry args={[0.44, 0.5, 0.03]} />
              <meshStandardMaterial color="#0d0d10" roughness={0.22} metalness={0.35} flatShading />
            </mesh>
            {/* glazing bar */}
            <mesh position={[0, 0, 0.055]}>
              <boxGeometry args={[0.025, 0.5, 0.01]} />
              <meshStandardMaterial color="#4a4a50" roughness={0.9} flatShading />
            </mesh>
          </group>
        ))}
      </group>

      {/* roof, craned into place */}
      <group ref={roofRef} position={[0, WALL, 0]}>
        <Roof
          pitch={pitch}
          hipInset={hipInset}
          textureKind={textureKind}
          roughness={roughness}
          metalness={metalness}
          tone={tone}
          edgeMaterial={edgeMaterial}
        />
      </group>

      {/* chimney */}
      <group ref={chimneyRef} position={[0, WALL - 0.15, 0]}>
        <Drawn args={[0.34, 1.55, 0.34]} position={[1.15, 0.775, -0.28]} color="#2e2e32" edgeMaterial={edgeMaterial} castShadow />
        <Drawn args={[0.46, 0.11, 0.46]} position={[1.15, 1.6, -0.28]} color="#43434a" edgeMaterial={edgeMaterial} castShadow />
      </group>

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
    </group>
  );
}
